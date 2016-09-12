/* global Scientilla */

(function () {

    angular.module("groups")
            .factory("GroupsService", GroupService);

    GroupService.$inject = ["Restangular", "AuthService", "$http"];

    function GroupService(Restangular, AuthService, $http) {
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
                memberships: []
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

            var memberships = _.cloneDeep(group.memberships);
            _.forEach(group.memberships, function (m) {
                m.user = m.user.id;
            });
            return service.save(group).then(function (g) {
                group.administrators = administrators;
                group.memberships = memberships;
                return group;
            });
        }


        function getGroups(query) {
            var populate = {populate: ['memberships', 'administrators']};

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
                        _.forEach(memberships, function (m) {
                            _.defaults(m, Scientilla.membership);
                            _.defaults(m.user, Scientilla.user);
                        });

                        return memberships;
                    });
        }

        function getProfile(groupId) {
            return this
                    .one(groupId)
                    .get({populate: ['memberships', 'administrators']});
        }

        return service;
    }

}());