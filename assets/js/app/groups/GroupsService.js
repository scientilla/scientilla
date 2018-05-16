/* global Scientilla */

(function () {

    angular.module("groups")
        .factory("GroupsService", GroupService);

    GroupService.$inject = [
        'Restangular'
    ];

    function GroupService(Restangular) {
        var service = Restangular.service("groups");

        service.getNewGroup = getNewGroup;
        service.put = put;
        service.validateData = validateData;
        service.getGroupsQuery = getGroupsQuery;
        service.save = save;
        service.doSave = doSave;
        service.getGroups = getGroups;
        service.getGroup = getGroup;
        service.getProfile = getProfile;
        service.addCollaborator = addCollaborator;
        service.removeCollaborator = removeCollaborator;
        service.addRelative = addRelative;
        service.removeChild = removeChild;

        return service;

        function getNewGroup() {
            return {
                name: "",
                administrators: [],
                members: []
            };
        }

        function put(group) {
            return Restangular.copy(group).put();
        }

        function validateData(group) {
            //validate user data
        }

        function getGroupsQuery(searchText) {
            var qs = {where: {or: [{name: {contains: searchText}}, {description: {contains: searchText}}]}};
            var model = 'groups';
            return {model: model, qs: qs};
        }

        function save(group) {
            if (group.id)
                return group.save();
            else
                return service.post(group);
        }

        function doSave(group) {
            if (group.administrators) {
                var administrators = group.administrators;
                group.administrators = _.map(group.administrators, 'id');
            }

            if (group.members) {
                var members = group.members;
                delete group.members;
            }

            if (group.memberships) {
                var memberships = group.memberships;
                delete group.memberships;
            }

            return service.save(group).then(function (g) {
                group.administrators = administrators;
                group.members = members;
                group.memberships = memberships;
                return group;
            });
        }


        function getGroup(groupId) {
            const populate = {populate: ['members', 'administrators', 'attributes', 'groupAttributes', 'memberships', 'childGroups', 'parentGroups', 'pis']};
            return service.one(groupId).get(populate);
        }

        function getGroups(query) {
            const populate = {populate: ['administrators', 'attributes', 'groupAttributes', 'pis']};
            const q = _.merge({}, query, populate);

            return service.getList(q);
        }

        function getProfile(groupId) {
            return getGroup(groupId);
        }

        function addCollaborator(group, user, active) {
            const newMembership = {
                group: group.id,
                user: user.id,
                active: active,
                synchronized: false
            };
            return Restangular
                .all('memberships')
                .customPOST(newMembership);
        }

        function removeCollaborator(group, user) {
            const membership = group.memberships.find(m => m.user === user.id);
            return Restangular
                .one('memberships', membership.id)
                .remove();
        }

        function addRelative(parent, child) {
            const newMembership = {
                parent_group: parent.id,
                child_group: child.id
            };
            return Restangular
                .all('membershipgroups')
                .customPOST(newMembership);
        }

        function removeChild(parent, child) {
            const qs = {where: {parent_group: parent.id, child_group: child.id}};
            return Restangular.all('membershipgroups').customGET('', qs)
                .then(res => {
                    if (!res.items[0]) return;

                    return Restangular
                        .one('membershipgroups', res.items[0].id)
                        .remove();
                });
        }

        return service;
    }

}());