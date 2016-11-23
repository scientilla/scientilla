/* global Scientilla */

(function () {

    angular.module("groups")
            .factory("GroupsService", GroupService);

    GroupService.$inject = ["Restangular", "AuthService", "$http", "Prototyper"];

    function GroupService(Restangular, AuthService, $http, Prototyper) {
        var service = Restangular.service("groups");

        service.getNewGroup = getNewGroup;
        service.put = put;
        service.validateData = validateData;
        service.getGroupsQuery = getGroupsQuery;
        service.save = save;
        service.doSave = doSave;
        service.getGroups = getGroups;
        service.getGroupMemebers = getGroupMemebers;
        service.getProfile = getProfile;

        return service;

        function getNewGroup() {
            return {
                name: "",
                administrators: [AuthService.user],
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
                return this.post(group);
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


        function getGroups(query) {
            var populate = {populate: ['members', 'administrators']};

            var q = _.merge({}, query, populate);

            return this.getList(q);
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
            return this
                    .one(groupId)
                    .get({populate: ['members', 'administrators']});
        }

        return service;
    }

}());