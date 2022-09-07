(function () {
    angular
        .module('phdTrainings')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/phd-trainings/drafts", {
                controller: 'requestHandler',
                template: () => '<phd-training-draft-list></phd-training-draft-list>'
            })
            .when("/:group?/phd-trainings/suggested", {
                controller: 'requestHandler',
                template: () => '<phd-training-suggested-list></phd-training-suggested-list>'
            })
            .when("/:group?/phd-trainings/verified", {
                controller: 'requestHandler',
                template: () => '<phd-training-verified-list></phd-training-verified-list>'
            });
    }

})();
