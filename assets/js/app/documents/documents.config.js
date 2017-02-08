(function () {
    angular
        .module('documents')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/users/:id/documents", {
                templateUrl: "partials/document-browsing.html",
                controller: "DocumentBrowsingController",
                controllerAs: 'vm',
                resolve: {
                    context: getUserContext
                }
            })
            .when("/groups/:id/documents", {
                templateUrl: "partials/document-browsing.html",
                controller: "DocumentBrowsingController",
                controllerAs: 'vm',
                resolve: {
                    context: getGroupContext
                }
            });
    }

    getUserContext.$inject = ['context', 'UsersService', '$route', 'UserDocumentsServiceFactory'];

    function getUserContext(context, UsersService, $route, UserDocumentsServiceFactory) {
        return getCurrentUser(UsersService, $route)
            .then(function (user) {
                context.setResearchEntity(user);
                var documentService = UserDocumentsServiceFactory.create(user, UsersService);
                context.setDocumentService(documentService);
                return context;
            });
    }
    getGroupContext.$inject = ['context', 'GroupsService', '$route', 'GroupDocumentsServiceFactory'];

    function getGroupContext(context, GroupsService, $route, GroupDocumentsServiceFactory) {
        return getCurrentGroup(GroupsService, $route)
            .then(function (group) {
                context.setResearchEntity(group);
                var documentService = GroupDocumentsServiceFactory.create(group, GroupsService);
                context.setDocumentService(documentService);
                return context;
            });
    }

    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: []});
    }

    getCurrentGroup.$inject = ['GroupsService', '$route'];

    function getCurrentGroup(GroupsService, $route) {
        var groupId = $route.current.params.id;
        return GroupsService.one(groupId).get({populate: []});
    }

})();
