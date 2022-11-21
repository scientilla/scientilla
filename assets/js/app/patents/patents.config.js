(function () {
    angular
        .module('patents')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/patents/suggested", {
                controller: 'requestHandler',
                template: () => '<scientilla-patent-suggested-list></scientilla-patent-suggested-list>'
            })
            .when("/:group?/patents/verified", {
                controller: 'requestHandler',
                template: () => '<scientilla-patent-verified-list></scientilla-patent-verified-list>'
            })
            .when("/:group?/patent-families/verified", {
                controller: 'requestHandler',
                template: () => '<scientilla-patent-family-verified-list></scientilla-patent-family-verified-list>'
            });
    }

})();
