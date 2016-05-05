/* global Scientilla */

(function () {
    angular.module("groups").factory("GroupsService",
            ["Restangular", "AuthService", "$http", function (Restangular, AuthService, $http) {
                    var service = Restangular.service("groups");

                    service.getNewGroup = function () {
                        return {
                            name: "",
                            administrators: [AuthService.user],
                            memberships: []
                        };
                    };

                    service.put = function (group) {
                        return Restangular.copy(group).put();
                    };

                    service.validateData = function (group) {
                        //validate user data
                    };

                    service.getGroupsQuery = function (searchText) {
                        var qs = {where: {or: [{name: {contains: searchText}}, {description: {contains: searchText}}]}};
                        var model = 'groups';
                        return {model: model, qs: qs};
                    };

                    service.save = function (group) {
                        if (group.id)
                            return group.save();
                        else
                            return this.post(group);
                    };

                    service.doSave = function (group) {
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
                    };


                    service.getGroups = function (query) {
                        var populate = {populate: ['memberships', 'administrators']};

                        var q = _.merge({}, query, populate);

                        return this.getList(q);
                    };

                    service.getGroupMemebers = function (groupId) {
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
                    };


                    return service;
                }]);
}());