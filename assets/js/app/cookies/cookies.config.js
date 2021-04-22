(function () {
    angular
        .module('cookies')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/cookies-policy", {
                template: `<cookies-policy></cookies-policy>`,
                access : {noLogin : true}
            });
    }
})();
