(function () {
    angular
        .module('projects')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/projects/verified", {
                controller: 'requestHandler',
                template: () => '<scientilla-project-verified-list></scientilla-project-verified-list>'
            });
    }

})();