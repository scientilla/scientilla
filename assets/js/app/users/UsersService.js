(function () {
    angular.module("users").factory("UsersService",
            ["Restangular", function (Restangular) {
                    var service = Restangular.service("users");

                    service.getNewUser = function () {
                        var user = {
                            name: "",
                            surname: "",
                            slug: "",
                            username: ""
                        }; 
                        _.assign(user, Scientilla.user);
                        return user;
                    };
                    
                    service.put = function(user) {
                        //TODO: check this Restangular bug
                        return Restangular.copy(user).put();
                    };

                    service.validateData = function (user) {
                        //validate user data
                    };
                    
                    return service;
                }]);
}());