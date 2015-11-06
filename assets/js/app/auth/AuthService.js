(function () {
    angular.module("auth").factory("AuthService",
            ["$http", "Restangular", "$q", "$rootScope", function ($http, Restangular, $q, $rootScope) {
                    var service = {
                        isLogged: false,
                        userId: null,
                        user: null,
                    };
                    //sTODO: refactor
                    service.login = function (credentials) {
                        return authOp('/auths/login', credentials);
                    },
                            service.register = function (registrationData) {
                                return authOp('/auths/register', registrationData);
                            },
                            service.logout = function () {
                                return $http.get('/auths/logout').then(function () {
                                    
                                    //sTODO: move to the proper place
                                    Restangular.setDefaultHeaders({access_token: undefined});
                                    delete $http.defaults.headers.common.access_token;
                                    service.isLogged = false;
                                    service.user = null;
                                    service.userId = null;
                                    $rootScope.$broadcast("LOGOUT");
                                });
                            };
                    return service;

                    function authOp(url, data) {
                        return $q(function (resolve, reject) {
                            $http.post(url, data)
                                    .then(function (result) {
                                        var user = result.data;
                                        service.user = user;
                                        _.assign(service.user, Scientilla.user);
                                        service.userId = result.data.id;
                                        service.username = result.data.username;
                                        return $http.get('/users/jwt');
                                    })
                                    .then(function (result) {
                                        
                                        //sTODO: move to the proper place
                                        service.isLogged = true;
                                        service.jwtToken = result.data.token;
                                        Restangular.setDefaultHeaders({access_token: service.jwtToken});
                                        $http.defaults.headers.common.access_token = service.jwtToken;


                                        $rootScope.$broadcast("LOGIN");
                                        resolve();
                                    })
                                    .catch(function (result) {
                                        reject();
                                    });

                        });
                    }
                    ;
                }]);
}());
