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
            .when("/:group?/dashboard", {
                controller: 'requestHandler',
                template: `<summary-dashboard></summary-dashboard>`
            });
    }
})();
