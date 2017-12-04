(function () {
    angular
        .module('admin')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/sources", {
                template: params => '' +
                    '<scientilla-admin-metrics></scientilla-admin-metrics>',
                resolve: {}
            })
            .when("/status", {
                template: '<scientilla-admin-status></scientilla-admin-status>'
            })
            .when("/backup", {
                template: '<scientilla-admin-backup></scientilla-admin-backup>'
            });

    }

})();
