(function () {
    angular
        .module('groups')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/groups", {
                templateUrl: "partials/group-browsing.html",
                controller: "GroupBrowsingController",
                controllerAs: 'vm'
            })
            .when("/groups/:id", {
                template: params => `<scientilla-group-details group-id="${params.id}"></scientilla-group-details>`,
                access: {
                    noLogin: true
                }
            });
    }

})();
