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
                        return '/profile';
                    }
                }
            })
            .when("/profile", {
                template: `<summary-profile></summary-profile>`
            })
            .when("/:group?/dashboard/documents-overview", {
                controller: 'requestHandler',
                template: `<summary-dashboard active-tab="documents-overview"></summary-dashboard>`
            })
            .when("/:group?/dashboard/bibliometric-charts", {
                controller: 'requestHandler',
                template: `<summary-dashboard active-tab="bibliometric-charts"></summary-dashboard>`
            })
            .when("/:group/dashboard/calculated-data", {
                controller: 'requestHandler',
                template: `<summary-dashboard active-tab="calculated-data"></summary-dashboard>`
            });
    }
})();
