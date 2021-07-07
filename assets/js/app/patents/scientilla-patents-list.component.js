/* global angular */
(function () {
    'use strict';

    angular.module('app')
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

        let query = {};
        let activeWatcher;

        vm.loadPatents = true;

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

        function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            if (_.has(query, 'where.translation') && query.where.translation) {
                delete query.where.translation;
            }

            if (_.has(query, 'where.priority') && !query.where.priority) {
                delete query.where.priority;
            }

            return PatentService.get(vm.researchEntity, query, favorites)
                .then(patents => vm.patents = patents);
        }
    }

})();