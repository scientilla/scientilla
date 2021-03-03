(function () {
    angular
        .module('accomplishments')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/accomplishments/suggested", {
                controller: 'requestHandler',
                template: () => '<scientilla-accomplishment-suggested-list></scientilla-accomplishment-suggested-list>'
            })
            .when("/:group?/accomplishments/verified", {
                controller: 'requestHandler',
                template: () => '<scientilla-accomplishment-verified-list></scientilla-accomplishment-verified-list>'
            })
            .when("/:group?/accomplishments/drafts", {
                controller: 'requestHandler',
                template: () => '<scientilla-accomplishment-drafts-list></scientilla-accomplishment-drafts-list>'
            });
    }

})();