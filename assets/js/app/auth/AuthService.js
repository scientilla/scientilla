/* global Scientilla */

(function () {
    angular.module("auth").factory("AuthService", AuthService);

    AuthService.$inject = ["$http", "Restangular", "UsersService", "$q", "$rootScope", "localStorageService"];

    function AuthService($http, Restangular, UsersService, $q, $rootScope, localStorageService) {

        var service = {
            isLogged: false,
            userId: null,
            username: null,
            user: null,
            jwtToken: null
        };

        var localData = localStorageService.get("authService");

        if (!!localData)
        {
            service = {
                isLogged: localData.isLogged,
                userId: localData.userId,
                username: localData.username,
                user: localData.user,
                jwtToken: localData.jwtToken
            };

            _.defaults(service.user, Scientilla.user);
            _.forEach(service.user.admininstratedGroups, function (g) {
                _.defaults(g, Scientilla.group);
            });


            Restangular.setDefaultHeaders({access_token: service.jwtToken});
            $http.defaults.headers.common.access_token = service.jwtToken;
            $rootScope.$broadcast("LOGIN");


        }

        //sTODO: refactor
        service.login = function (credentials) {

            return authOp('/auths/login', credentials);
        };
        service.register = function (registrationData) {
            return authOp('/auths/register', registrationData);
        };
        service.logout = function () {
            return $http.get('/auths/logout').then(function () {

                //sTODO: move to the proper place
                Restangular.setDefaultHeaders({access_token: undefined});
                delete $http.defaults.headers.common.access_token;
                service.isLogged = false;
                service.user = null;
                service.userId = null;
                $rootScope.$broadcast("LOGOUT");

                localStorageService.set("authService", null);

            });
        };
        return service;

        function authOp(url, data) {
            return $q(function (resolve, reject) {
                $http.post(url, data)
                        .then(function (result) {
                            service.userId = result.data.id;
                            service.username = result.data.username;
                            return UsersService.one(result.data.id).get({populate: ['admininstratedGroups']});
                        })
                        .then(function (user) {
                            service.user = user;
                            _.defaults(service.user, Scientilla.user);
                            _.forEach(service.user.admininstratedGroups, function (g) {
                                _.defaults(g, Scientilla.group);
                            });
                            user.admininstratedGroups = Restangular.restangularizeCollection(null, user.admininstratedGroups, 'groups');
                            return $http.get('/users/jwt');
                        })
                        .then(function (result) {

                            //sTODO: move to the proper place
                            service.isLogged = true;
                            service.jwtToken = result.data.token;
                            Restangular.setDefaultHeaders({access_token: service.jwtToken});
                            $http.defaults.headers.common.access_token = service.jwtToken;


                            localStorageService.set("authService", {
                                isLogged: service.isLogged,
                                userId: service.userId,
                                username: service.username,
                                user: service.user,
                                jwtToken: service.jwtToken
                            });

                            $rootScope.$broadcast("LOGIN");
                            resolve();
                        })
                        .catch(function (result) {
                            reject();
                        });

            });
        }
        ;
    }

}());
