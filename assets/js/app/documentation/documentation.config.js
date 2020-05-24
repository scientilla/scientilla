(function () {
    angular
        .module('documentation')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/documentation", {
                template: `<documentation-viewer></documentation-viewer>`,
                access : {noLogin : true}
            });
    }
})();
