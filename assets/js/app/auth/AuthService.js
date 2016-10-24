/* global Scientilla */

(function () {
    angular.module("auth").factory("AuthService", AuthService);

    AuthService.$inject = ["$http", "Restangular", "UsersService", "$q", "localStorageService", "EventsService", "Prototyper"];

    function AuthService($http, Restangular, UsersService, $q, localStorageService, EventsService, Prototyper) {

        var service = {
            isLogged: false,
            userId: null,
            username: null,
            user: null,
            jwtToken: null
        };

        activate();

        function activate() {
            var localData = localStorageService.get("authService");

            if (!localData)
                return;

            service = {
                isLogged: localData.isLogged,
                userId: localData.userId,
                username: localData.username,
                user: localData.user,
                jwtToken: localData.jwtToken
            };

            service.user = Restangular.copy(service.user);

            Prototyper.toUserModel(service.user);

            Restangular.setDefaultHeaders({access_token: service.jwtToken});
            $http.defaults.headers.common.access_token = service.jwtToken;
            EventsService.publish(EventsService.AUTH_LOGIN);
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
                EventsService.publish(EventsService.AUTH_LOGOUT);

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
                        Prototyper.toUserModel(service.user);
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

                        EventsService.publish(EventsService.AUTH_LOGIN);
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
