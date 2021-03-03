(function () {
    "use strict";
    angular.module("app")
        .controller('requestHandler', requestHandler);

    requestHandler.$inject = [
        '$routeParams',
        'path',
        'AuthService',
        'context'
    ];

    /*
     * This function handles the request declared above.
     * It validates the group slug (optional) and redirects if the group slug is not valid.
     */
    function requestHandler($routeParams, path, AuthService, context) {

        let activeGroup;
        const user = AuthService.user;

        if (!$routeParams.group) {
            return context.setSubResearchEntity(user);
        }

        activeGroup = user.administratedGroups.find(g => g.slug === $routeParams.group);

        if (activeGroup) {
            return context.setSubResearchEntity(activeGroup);
        }

        path.goTo('/');
    }
})();