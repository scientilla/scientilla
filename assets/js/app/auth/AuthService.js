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
            expiration: null,
            loadAuthenticationData: loadAuthenticationData,
            login: login,
            register: register,
            logout: logout
        };

        return service;

        function setupUserAccount(userId) {
            return UsersService.getProfile(userId)
                .then(function (user) {
                    service.user = user;
                    service.userId = user.id;
                    service.username = user.username;
                    return $http.get(apiPrefix + '/users/jwt');
                })
                .then(function (result) {
                    service.isLogged = true;
                    service.jwtToken = result.data.token;
                    service.expiration = result.data.expires;
                    Restangular.setDefaultHeaders({access_token: service.jwtToken});
                    $http.defaults.headers.common.access_token = service.jwtToken;

                    localStorageService.set("authService", {
                        isLogged: service.isLogged,
                        userId: service.userId,
                        username: service.username,
                        user: service.user,
                        jwtToken: service.jwtToken,
                        expiration: service.expiration
                    });

                    EventsService.publish(EventsService.AUTH_LOGIN, service.user);
                    if (!service.user.alreadyAccess)
                        ModalService.openWizard([
                            'welcome',
                            'scopus-edit',
                            'tutorial',
                            'admin-tutorial',
                        ], false);
                });
        }

        function loadAuthenticationData() {
            const authenticationData = localStorageService.get("authService");
            service.expiration = _.get(authenticationData, 'expiration');
            const userId = _.get(authenticationData, 'userId');
            if (!service.expiration)
                return;

            const jwtExpiration = new Date(service.expiration);
            if (jwtExpiration < new Date()) {
                clearUserAccount();
                return;
            }

            setupUserAccount(userId);
        }

        function login(credentials) {
            credentials.username = credentials.username.toLowerCase();
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

        function clearUserAccount() {
            Restangular.setDefaultHeaders({access_token: undefined});
            delete $http.defaults.headers.common.access_token;
            service.isLogged = false;
            service.user = null;
            service.userId = null;

            localStorageService.set("authService", null);
        }

        function logout() {
            return $http.get(apiPrefix + '/auths/logout')
                .then(function () {
                    EventsService.publish(EventsService.AUTH_LOGOUT);
                    clearUserAccount();
                });
        }
    }

}());
