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
                    controllerAs: 'vm',
                })
                .when("/groups/new", {
                    templateUrl: "partials/group-form.html",
                    controller: "GroupFormController",
                    controllerAs: 'vm',
                    resolve: {
                        group: newGroup
                    }
                })
                .when("/groups/:id", {
                    templateUrl: "partials/group-form.html",
                    controller: "GroupFormController",
                    controllerAs: 'vm',
                    resolve: {
                        group: currentGroup
                    }
                });
    }


    currentGroup.$inject = ['GroupsService', 'AuthService', '$route', 'Restangular'];

    function currentGroup(GroupsService, AuthService, $route, Restangular) {
        var groupId = $route.current.params.id;
        //sTODO: refactor
        return GroupsService.one(groupId).get({populate: ['memberships', 'administrators']});
    }


    newGroup.$inject = ['GroupsService', 'AuthService'];

    function newGroup(GroupsService, AuthService) {
        return GroupsService.getNewGroup();
    }

})();
