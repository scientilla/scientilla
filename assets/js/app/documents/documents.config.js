(function () {
    angular
        .module('documents')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/documents/suggested", {
                controller: 'requestHandler',
                template: () => '<scientilla-suggested-documents></scientilla-suggested-documents>'
            })
            .when("/:group?/documents/verified", {
                controller: 'requestHandler',
                template: () => '<scientilla-verified-list></scientilla-verified-list>'
            })
            .when("/:group?/documents/drafts", {
                controller: 'requestHandler',
                template: () => '<scientilla-drafts-list></scientilla-drafts-list>'
            })
            .when("/:group?/documents/external", {
                controller: 'requestHandler',
                template: () => '<scientilla-external-documents></scientilla-external-documents>'
            });
    }

})();
