/* global Scientilla */

(function () {

    angular.module("groups")
        .factory("GroupsService", GroupService);

    GroupService.$inject = [
        'Restangular',
        'Prototyper'
    ];

    function GroupService(Restangular, Prototyper) {
        var service = Restangular.service("groups");

        service.getNewGroup = getNewGroup;
        service.put = put;
        service.validateData = validateData;
        service.getGroupsQuery = getGroupsQuery;
        service.save = save;
        service.doSave = doSave;
        service.getGroups = getGroups;
        service.getGroup = getGroup;
        service.addCollaborator = addCollaborator;
        service.removeCollaborator = removeCollaborator;
        service.addRelative = addRelative;
        service.removeChild = removeChild;
        service.getSettings = getSettings;
        service.getConnectedGroups = getConnectedGroups;
        service.getMembershipGroups = getMembershipGroups;
        service.getTypeTitle = getTypeTitle;

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
            const associationsKeys = [
                'members',
                'memberships',
                'pis',
                'attributes',
                'groupAttributes'
            ];
            const associations = {};
            associationsKeys.forEach(key => associations[key] = group[key]);

            const administrators = group.administrators;
            if (group.administrators)
                group.administrators = group.administrators.map(a => a.id);

            associationsKeys.forEach(key => delete group[key]);
            return service.save(group)
                .then(function (g) {
                    associationsKeys.forEach(key => group[key] = associations[key]);
                    group.administrators = administrators;
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

        function getMembershipGroups() {
            return Restangular.all('membershipgroups').customGET('', {
                //where: {active: true},
                populate: ['parent_group', 'child_group']
            }).then(res => {
                return res.items;
            });
        }

        function getConnectedGroups(groupId) {
            return Restangular.all('membershipgroups').customGET('', {
                where: {
                   child_group: groupId
                },
                populate: ['parent_group', 'child_group']
            }).then(res => {
                const groups = [];
                for (const group of res.items) {
                    if (_.has(group, 'child_group') && !_.isEmpty(group.child_group)) {
                        const childGroup = Prototyper.toGroupModel(group.child_group);

                        if (!_.find(groups, childGroup)) {
                            groups.push(childGroup);
                        }
                    }

                    if (_.has(group, 'parent_group') && !_.isEmpty(group.parent_group)) {
                        const parentGroup = Prototyper.toGroupModel(group.parent_group);

                        if (!_.find(groups, parentGroup)) {
                            groups.push(parentGroup);
                        }
                    }
                }
                return groups;
            });
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

        function getSettings(groupId) {
            return getGroup(groupId);
        }

        function getTypeTitle(type, groups) {
            switch (true) {
                case type === 'Research Line' && groups.length === 1:
                    return 'Research line';
                case type === 'Research Line' && groups.length > 1:
                    return 'Research lines';
                case type === 'Institute' && groups.length === 1:
                    return 'Institute';
                case type === 'Institute' && groups.length > 1:
                    return 'Institutes';
                case type === 'Center' && groups.length === 1:
                    return 'Center';
                case type === 'Center' && groups.length > 1:
                    return 'Centers';
                case type === 'Facility' && groups.length === 1:
                    return 'Facility';
                case type === 'Facility' && groups.length > 1:
                    return 'Facilities';
                case type === 'Directorate' && groups.length === 1:
                    return 'Directorate';
                case type === 'Directorate' && groups.length > 1:
                    return 'Directorates';
                default:
                    return '';
            }
        }

        return service;
    }

}());