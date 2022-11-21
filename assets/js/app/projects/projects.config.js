(function () {
    angular
        .module('projects')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/projects/suggested", {
                controller: 'requestHandler',
                template: () => '<scientilla-project-suggested-list></scientilla-project-suggested-list>'
            })
            .when("/:group?/projects/verified", {
                controller: 'requestHandler',
                template: () => '<scientilla-project-verified-list></scientilla-project-verified-list>'
            });
    }

})();
