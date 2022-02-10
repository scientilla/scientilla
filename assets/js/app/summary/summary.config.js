(function () {
    angular
        .module('summary')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/profile", {
                template: `<summary-profile></summary-profile>`
            })
            .when("/dashboard", {
                redirectTo: '/dashboard/document-charts'
            })
            .when("/dashboard/document-charts", {
                controller: 'requestHandler',
                template: () => `<summary-dashboard
                    active-tab="document-charts"></summary-dashboard>`
            })
            .when("/dashboard/metric-charts", {
                controller: 'requestHandler',
                template: () => `<summary-dashboard
                    active-tab="metric-charts"></summary-dashboard>`
            })
            .when("/dashboard/projects-and-technology-transfer", {
                controller: 'requestHandler',
                template: () => `<summary-dashboard
                    active-tab="projects-and-technology-transfer"></summary-dashboard>`
            })
            .when("/:group?/dashboard", {
                redirectTo: '/:group?/dashboard/document-charts'
            })
            .when("/:group?/dashboard/document-charts", {
                controller: 'requestHandler',
                template: () => `<summary-dashboard
                    active-tab="document-charts"></summary-dashboard>`
            })
            .when("/:group?/dashboard/metric-charts", {
                controller: 'requestHandler',
                template: () => `<summary-dashboard
                    active-tab="metric-charts"></summary-dashboard>`
            })
            .when("/:group?/dashboard/projects-and-technology-transfer", {
                controller: 'requestHandler',
                template: () => `<summary-dashboard
                    active-tab="projects-and-technology-transfer"></summary-dashboard>`
            });
    }
})();
