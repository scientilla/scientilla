(function () {
    'use strict';

    angular.module('components')
        .component('scientillaMenu', {
            templateUrl: 'partials/scientilla-menu.html',
            controller: scientillaMenu,
            controllerAs: 'vm'
        });

    scientillaMenu.$inject = [
        'AuthService',
        'EventsService',
        'path',
        'context',
        'GroupsService'
    ];

    function scientillaMenu(AuthService, EventsService, path, context, GroupsService) {
        const vm = this;

        vm.isActive = isActive;
        vm.isAdmin = isAdmin;
        vm.getUrl = getUrl;
        vm.getDashboardUrl = getDashboardUrl;

        vm.$onInit = function () {

            EventsService.subscribeAll(vm, [
                EventsService.AUTH_LOGIN,
                EventsService.AUTH_LOGOUT
            ], refresh);

            refresh();
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;
        }

        function isActive(page, checkResearchEntity = false) {
            let researchEntity = context.getResearchEntity();
            //console.log(researchEntity.getType());

            if (page === '/') {
                // Add the group slug to the URL when the researchEntity is a group to check the active state of an URL
                if (researchEntity.getType() === 'group' && checkResearchEntity) {
                    return (path.current === '?#/' + researchEntity.slug || path.current === '#/' + researchEntity.slug);
                } else {
                    return (path.current === '?#' + page || path.current === '#' + page);
                }
            } else {
                // Add the group slug to the URL when the researchEntity is a group to check the active state of an URL
                if (researchEntity.getType() === 'group' && checkResearchEntity) {
                    return (
                        path.current.lastIndexOf('?#/' + researchEntity.slug + page, 0) === 0 ||
                        path.current.lastIndexOf('#/' + researchEntity.slug + page, 0) === 0
                    );
                } else {
                    return (
                        path.current.lastIndexOf('?#' + page, 0) === 0 ||
                        path.current.lastIndexOf('#' + page, 0) === 0
                    );
                }
            }
        }

        function isAdmin() {
            return vm.user && vm.user.isAdmin();
        }

        function getUrl(url) {
            let researchEntity = context.getResearchEntity(),
                prefix = '#/';

            if (researchEntity.getType() === 'group') {
                return prefix + researchEntity.slug + '/' + url;
            }

            return prefix + url;
        }

        function getDashboardUrl() {
            let researchEntity = context.getResearchEntity(),
                prefix = '#/';

            if (researchEntity.getType() === 'group') {
                return prefix + researchEntity.slug;
            }

            return prefix;
        }
    }

})();