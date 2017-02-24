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
                templateUrl: "partials/group-details.html",
                controller: "GroupDetailsController",
                controllerAs: 'vm',
                resolve: {
                    group: currentGroup
                },
                access: {
                    noLogin: true
                }
            });
    }


    currentGroup.$inject = ['GroupsService', '$route', 'context', 'GroupDocumentsServiceFactory'];

    function currentGroup(GroupsService, $route, context, GroupDocumentsServiceFactory) {
        var groupId = $route.current.params.id;

        return GroupsService.getGroup(groupId);
    }


    newGroup.$inject = ['GroupsService'];

    function newGroup(GroupsService) {
        return GroupsService.getNewGroup();
    }

})();
