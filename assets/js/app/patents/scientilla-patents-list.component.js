/* global angular */
(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatentsList', {
            templateUrl: 'partials/scientilla-patents-list.html',
            controller: scientillaPatentsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                section: '<',
                active: '<?'
            }
        });

    scientillaPatentsList.$inject = [
        'PatentService',
        '$element',
        '$scope'
    ];

    function scientillaPatentsList(
        PatentService,
        $element,
        $scope
    ) {
        const vm = this;

        vm.name = 'patents-list';
        vm.shouldBeReloaded = true;

        vm.patents = [];
        vm.onFilter = onFilter;
        vm.exportDownload = patents => PatentService.exportDownload(patents, 'csv');
        vm.onChange = onChange;

        let query = {};
        let activeWatcher;

        vm.loadPatents = true;
        vm.section = 'verified';

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            if (_.has(vm, 'active')) {
                vm.loadPatents = angular.copy(vm.active);

                activeWatcher = $scope.$watch('vm.active', () => {
                    vm.loadPatents = angular.copy(vm.active);

                    if (vm.loadPatents) {
                        $scope.$broadcast('filter');
                    } else {
                        vm.patents = [];
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

            query = PatentService.handleQuery(query);

            vm.patents = await PatentService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */

        function onChange(structure, values, key) {
            PatentService.onChange(structure, values, key, vm.section);
        }
    }

})();
