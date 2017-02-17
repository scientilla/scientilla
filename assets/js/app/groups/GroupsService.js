/* global Scientilla */

(function () {

    angular.module("groups")
            .factory("GroupsService", GroupService);

    GroupService.$inject = ["Restangular", "$http", "Prototyper"];

    function GroupService(Restangular, $http, Prototyper) {
        var service = Restangular.service("groups");

        service.getNewGroup = getNewGroup;
        service.put = put;
        service.validateData = validateData;
        service.getGroupsQuery = getGroupsQuery;
        service.save = save;
        service.doSave = doSave;
        service.getGroups = getGroups;
        service.getGroup = getGroup;
        service.getGroupMemebers = getGroupMemebers;
        service.getProfile = getProfile;

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
            var administrators = group.administrators;
            group.administrators = _.map(group.administrators, 'id');

            var members = group.members;
            group.members = _.map(group.members, 'id');

            return service.save(group).then(function (g) {
                group.administrators = administrators;
                group.members = members;
                return group;
            });
        }


        function getGroup(groupId) {
            var populate = {populate: ['members', 'administrators']};

            return service.one(groupId).get(populate);
        }

        function getGroups(query) {
            var populate = {populate: ['members', 'administrators']};

            var q = _.merge({}, query, populate);

            return service.getList(q);
        }

        function getGroupMemebers(groupId) {
            if (!groupId)
                return;

            return $http.get('/memberships',
                    {params: {group: groupId, populate: 'user'}})
                    .then(function (result) {
                        var memberships = result.data;
                        Prototyper.toMembershipsCollection(memberships);
                        return memberships;
                    });
        }

        function getProfile(groupId) {
            return getGroup(groupId);
        }

        return service;
    }

}());