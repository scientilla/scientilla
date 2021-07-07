/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaProjectsList', {
            templateUrl: 'partials/scientilla-projects-list.html',
            controller: scientillaProjectsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                section: '<',
                active: '<?'
            }
        });

    scientillaProjectsList.$inject = [
        'ProjectService',
        '$element',
        '$scope'
    ];

    function scientillaProjectsList(
        ProjectService,
        $element,
        $scope
    ) {
        const vm = this;

        vm.name = 'projects-list';
        vm.shouldBeReloaded = true;

        vm.projects = [];
        vm.onFilter = onFilter;
        vm.exportDownload = projects => ProjectService.exportDownload(projects, 'csv');

        let query = {};
        let activeWatcher;

        vm.loadProjects = true;

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            if (_.has(vm, 'active')) {
                vm.loadProjects = angular.copy(vm.active);

                activeWatcher = $scope.$watch('vm.active', () => {
                    vm.loadProjects = angular.copy(vm.active);

                    if (vm.loadProjects) {
                        $scope.$broadcast('filter');
                    } else {
                        vm.projects = [];
                    }
                });
            }
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);

            if (_.isFunction(activeWatcher)) {
                activeWatcher();
            }
        };

        vm.reload = function () {

        };

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            vm.projects = await ProjectService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();