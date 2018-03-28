/* global Scientilla */

(function () {
    angular.module("auth").factory("AuthService", AuthService);

    AuthService.$inject = [
        "Restangular",
        "UsersService",
        "ModalService",
        "localStorageService",
        "EventsService"
    ];

    function AuthService(Restangular,
                         UsersService,
                         ModalService,
                         localStorageService,
                         EventsService) {

        const service = {
            isLogged: false,
            isAdmin: false,
            userId: null,
            username: null,
            user: null,
            jwtToken: null,
            expiration: null,
            isAvailable: true,
            loadAuthenticationData: loadAuthenticationData,
            login: login,
            register: register,
            logout: logout,
            setupUserAccount: setupUserAccount
        };

        return service;

        function setupUserAccount(userId) {
            if (!service.isAvailable && !service.isAdmin)
                return;
            return UsersService.getProfile(userId)
                .then(function (user) {
                    service.user = user;
                    service.userId = user.id;
                    service.username = user.username;
                    const url = '/users/jwt';
                    return Restangular.one(url).get();
                })
                .then(function (jwt) {
                    service.isLogged = true;
                    service.jwtToken = jwt.token;
                    service.expiration = jwt.expires;
                    Restangular.setDefaultHeaders({access_token: service.jwtToken});

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
                        ]);
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
            const url = 'auths/login';
            return Restangular.all(url).post(credentials)
                .then(function (data) {
                    return setupUserAccount(data.id);
                });
        }

        function register(registrationData) {
            const url = '/auths/register';
            registrationData.username = registrationData.username.toLowerCase();
            return Restangular.all(url).post(registrationData)
                .then(function (data) {
                    return setupUserAccount(data.id);
                });
        }

        function clearUserAccount() {
            Restangular.setDefaultHeaders({access_token: undefined});
            service.isLogged = false;
            service.user = null;
            service.userId = null;

            localStorageService.set("authService", null);
        }

        function logout() {
            const url = 'auths/logout';
            return Restangular.all(url).post()
                .then(function () {
                    EventsService.publish(EventsService.AUTH_LOGOUT);
                    clearUserAccount();
                });
        }
    }

}());
