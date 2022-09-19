(function () {
    angular
        .module('trainingModules')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/training-modules/suggested", {
                controller: 'requestHandler',
                template: () => '<training-module-suggested-list></training-module-suggested-list>'
            })
            .when("/:group?/training-modules/verified", {
                controller: 'requestHandler',
                template: () => '<training-module-verified-list></training-module-verified-list>'
            })
            .when("/:group?/training-modules/drafts", {
                controller: 'requestHandler',
                template: () => '<training-module-draft-list></training-module-draft-list>'
            });
    }

})();
