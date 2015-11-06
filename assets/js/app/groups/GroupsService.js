(function () {
    angular.module("groups").factory("GroupsService",
            ["Restangular", function (Restangular) {
                    var service = Restangular.service("groups");

                    service.getNewGroup = function () {
                        return {
                            name: ""
                        }; 
                    };
                    
                    service.put = function(group) {
                        return Restangular.copy(group).put();
                    };

                    service.validateData = function (group) {
                        //validate user data
                    };
                    
                    return service;
                }]);
}());