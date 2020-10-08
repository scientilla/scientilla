(function () {
    angular
        .module('charts')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/charts", {
                controller: 'requestHandler',
                redirectTo: params => {
                    if (_.has(params, 'group')) {
                        return '/' + params.group + '/charts/documents-overview';
                    } else {
                        return '/charts/documents-overview';
                    }
                }
            })
            .when("/:group?/charts/documents-overview", {
                controller: 'requestHandler',
                template: `<documents-overview></documents-overview>`,
                resolve: {
                    authService: getAuthService
                }
            })
            .when("/:group?/charts/bibliometric-charts", {
                controller: 'requestHandler',
                template: `<bibliometrics></bibliometrics>`,
                resolve: {
                    authService: getAuthService
                }
            });

        getAuthService.$inject = ['AuthService'];

        function getAuthService(AuthService) {
            return AuthService;
        }
    }
})();
