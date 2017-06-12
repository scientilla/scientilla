/* global Scientilla */

(function () {
    angular.module("auth").factory("AuthService", AuthService);

    AuthService.$inject = [
        "$http",
        "Restangular",
        "UsersService",
        "ModalService",
        "localStorageService",
        "EventsService",
        "apiPrefix",
    ];

    function AuthService($http,
                         Restangular,
                         UsersService,
                         ModalService,
                         localStorageService,
                         EventsService,
                         apiPrefix) {

        const service = {
            isLogged: false,
            userId: null,
            username: null,
            user: null,
            jwtToken: null,
            loadAuthenticationData: loadAuthenticationData,
            login: login,
            register: register,
            logout: logout
        };

        return service;

        function setupUserAccount(userId) {
            return UsersService.getCompleteProfile(userId)
                .then(function (user) {
                    service.user = user;
                    service.userId = user.id;
                    service.username = user.username;
                    return $http.get(apiPrefix + '/users/jwt');
                })
                .then(function (result) {
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

                    EventsService.publish(EventsService.AUTH_LOGIN, service.user);
                    if (!service.user.alreadyAccess)
                        ModalService.openWizard(false);
                });
        }

        function loadAuthenticationData() {
            const localAuthenticationData = localStorageService.get("authService");
            if (!localAuthenticationData)
                return;

            setupUserAccount(localAuthenticationData.userId);
        }

        function login(credentials) {
            const url = apiPrefix + '/auths/login';
            return $http.post(url, credentials)
                .then(function (result) {
                    return setupUserAccount(result.data.id);
                });
        }

        function register(registrationData) {
            const url = apiPrefix + '/auths/register';
            return $http.post(url, registrationData)
                .then(function (result) {
                    return setupUserAccount(result.data.id);
                });
        }

        function logout() {
            return $http.get(apiPrefix + '/auths/logout').then(function () {

                Restangular.setDefaultHeaders({access_token: undefined});
                delete $http.defaults.headers.common.access_token;
                service.isLogged = false;
                service.user = null;
                service.userId = null;
                EventsService.publish(EventsService.AUTH_LOGOUT);

                localStorageService.set("authService", null);

            });
        }
    }

}());
