(function () {
    angular
        .module('errors')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when('/403', {
                template: '<error-403></error-403>',
            })
            .when('/404', {
                template: '<error-404></error-404>',
            })
            .when('/500', {
                template: '<error-500></error-500>',
            });
    }
})();