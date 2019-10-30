(function () {
    angular
        .module('admin')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/sources", {
                template: params => '' +
                    '<scientilla-admin-sources></scientilla-admin-sources>',
                resolve: {}
            })
            .when("/tools", {
                template: '<scientilla-admin-tools></scientilla-admin-tools>'
            })
            .when("/connectors", {
                template: '<scientilla-admin-external-connectors></scientilla-admin-external-connectors>'
            })
            .when("/customize", {
                template: '<scientilla-admin-customize></scientilla-admin-customize>'
            });

    }

})();
