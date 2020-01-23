(function () {
    angular
        .module('summary')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/dashboard", {
                controller: 'requestHandler',
                redirectTo: params => {
                    if (_.has(params, 'group')) {
                        return '/' + params.group + '/dashboard/documents-overview';
                    } else {
                        return '/dashboard/profile';
                    }
                }
            })
            .when("/dashboard/profile", {
                template: `<profile-summary
                    active-tab="profile"></profile-summary>`
            })
            .when("/dashboard/profile-v2", {
                template: `<profile-summary
                    active-tab="profile-v2"></profile-summary>`
            })
            .when("/:group?/dashboard/documents-overview", {
                controller: 'requestHandler',
                template: `<profile-summary
                    active-tab="documents-overview"></profile-summary>`,
                resolve: {
                    authService: getAuthService
                }
            })
            .when("/:group?/dashboard/bibliometric-charts", {
                controller: 'requestHandler',
                template: `<profile-summary
                    active-tab="bibliometric-charts"></profile-summary>`,
                resolve: {
                    authService: getAuthService
                }
            })
            .when("/:group/dashboard/calculated-data", {
                controller: 'requestHandler',
                template: `<profile-summary
                    active-tab="calculated-data"></profile-summary>`,
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
