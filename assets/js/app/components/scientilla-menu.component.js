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
        'context'
    ];

    function scientillaMenu(AuthService, EventsService, path, context) {
        const vm = this;

        vm.isActive = isActive;
        vm.isAdmin = isAdmin;
        vm.getUrl = getUrl;
        vm.getDashboardUrl = getDashboardUrl;

        const prefix = '#/';
        let subResearchEntity = context.getSubResearchEntity();

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
            subResearchEntity = context.getSubResearchEntity();
        }

        function isActive(page, checkSubResearchEntity = false) {
            if (page === '/') {
                // Add the group slug to the URL when the subResearchEntity is a group to check the active state of an URL
                if (subResearchEntity.getType() === 'group' && checkSubResearchEntity) {
                    return (path.current === '?#/' + subResearchEntity.slug || path.current === '#/' + subResearchEntity.slug);
                } else {
                    return (path.current === '?#' + page || path.current === '#' + page);
                }
            } else {
                // Add the group slug to the URL when the subResearchEntity is a group to check the active state of an URL
                if (subResearchEntity.getType() === 'group' && checkSubResearchEntity) {
                    return (
                        path.current.lastIndexOf('?#/' + subResearchEntity.slug + page, 0) === 0 ||
                        path.current.lastIndexOf('#/' + subResearchEntity.slug + page, 0) === 0
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
            if (subResearchEntity.getType() === 'group') {
                return prefix + subResearchEntity.slug + '/' + url;
            }

            return prefix + url;
        }

        function getDashboardUrl() {
            if (subResearchEntity.getType() === 'group') {
                return prefix + subResearchEntity.slug;
            }

            return prefix;
        }
    }

})();