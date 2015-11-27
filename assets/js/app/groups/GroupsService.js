(function () {
    angular.module("groups").factory("GroupsService",
            ["Restangular", "AuthService", function (Restangular, AuthService) {
                    var service = Restangular.service("groups");

                    service.getNewGroup = function () {
                        return {
                            name: "",
                            administrators: [AuthService.user],
                            memberships: []
                        }; 
                    };
                    
                    service.put = function(group) {
                        return Restangular.copy(group).put();
                    };

                    service.validateData = function (group) {
                        //validate user data
                    };
                    
                    service.getGroupsQuery = function(searchText) {
                        var qs = {where: {or: [{name: {contains: searchText}}, {description: {contains: searchText}}]}};
                        var model = 'groups';
                        return {model: model, qs: qs};
                    }
                    
                    return service;
                }]);
}());