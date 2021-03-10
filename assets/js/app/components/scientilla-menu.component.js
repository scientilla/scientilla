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
        'ExternalConnectorService',
        'groupTypes'
    ];

    function scientillaMenu(AuthService, EventsService, path, context, ExternalConnectorService, groupTypes) {
        const vm = this;

        vm.isActive = isActive;
        vm.isSuperViewer = isSuperViewer;
        vm.isSuperUser = isSuperUser;
        vm.isAdmin = isAdmin;
        vm.getUrl = getUrl;
        vm.isUser = isUser;
        vm.isGroup = isGroup;
        vm.hasActiveExternalConnectors = false;
        vm.isProject = isProject;

        const prefix = '#/';
        vm.subResearchEntity = context.getSubResearchEntity();

        vm.$onInit = function () {

            EventsService.subscribeAll(vm, [
                EventsService.AUTH_LOGIN,
                EventsService.AUTH_LOGOUT
            ], refresh);

            refresh();

            ExternalConnectorService.getConnectors().then((connectors) => {
                vm.connectors = connectors;
                checkActiveConnectors();
            });

            EventsService.subscribe(vm, EventsService.CONNECTORS_CHANGED, function (event, connectors) {
                vm.connectors = connectors;
                checkActiveConnectors();
            });
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;
            vm.subResearchEntity = context.getSubResearchEntity();
        }

        function isActive(page, checkSubResearchEntity = false) {
            if (page === '/') {
                // Add the group slug to the URL when the subResearchEntity is a group to check the active state of an URL
                if (vm.subResearchEntity.getType() === 'group' && checkSubResearchEntity) {
                    return (path.current === '?#/' + vm.subResearchEntity.slug || path.current === '#/' + vm.subResearchEntity.slug);
                } else {
                    return (path.current === '?#' + page || path.current === '#' + page);
                }
            } else {
                // Add the group slug to the URL when the subResearchEntity is a group to check the active state of an URL
                if (vm.subResearchEntity.getType() === 'group' && checkSubResearchEntity) {
                    return (
                        path.current.lastIndexOf('?#/' + vm.subResearchEntity.slug + page, 0) === 0 ||
                        path.current.lastIndexOf('#/' + vm.subResearchEntity.slug + page, 0) === 0
                    );
                } else {
                    return (
                        path.current.lastIndexOf('?#' + page, 0) === 0 ||
                        path.current.lastIndexOf('#' + page, 0) === 0
                    );
                }
            }
        }


        function isSuperViewer() {
            return vm.user && vm.user.isSuperViewer();
        }

        function isSuperUser() {
            return vm.user && vm.user.isSuperUser();
        }

        function isAdmin() {
            return vm.user && vm.user.isAdmin();
        }

        function isUser() {
            return vm.subResearchEntity.getType() === 'user';
        }

        function isGroup() {
            return vm.subResearchEntity.getType() === 'group';
        }

        function getUrl(url) {
            if (vm.subResearchEntity.getType() === 'group') {
                return prefix + vm.subResearchEntity.slug + '/' + url;
            }

            return prefix + url;
        }

        function checkActiveConnectors() {

            vm.hasActiveExternalConnectors = false;

            Object.keys(vm.connectors).forEach(function (connector) {
                if (vm.connectors[connector].active) {
                    vm.hasActiveExternalConnectors = true;
                }
            });
        }

        function isProject() {
            if (isGroup() && vm.subResearchEntity.type === groupTypes.PROJECT) {
                return true;
            }

            return false;
        }
    }

})();