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

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            if (!_.has(query, 'where.type')) {
                return;
            }

            switch (true) {
                case query.where.type === 'prosecutions':
                    query.where.translation = false;
                    query.where.priority = false;
                    break;
                case query.where.type === 'priorities':
                    query.where.translation = false;
                    query.where.priority = true;
                    break;
                case query.where.type === 'all' && _.has(query, 'where.translation') && query.where.translation:
                    delete query.where.translation;
                    delete query.where.priority;
                    query.where.or = [
                        {
                            issueYear: query.where.issueYear,
                            translation: true
                        }, {
                            filingYear: query.where.issueYear,
                            translation: false
                        }
                    ];
                    delete query.where.issueYear;
                    break;
                case query.where.type === 'all' && (
                    !_.has(query, 'where.translation') ||
                    (
                        _.has(query, 'where.translation') &&
                        !query.where.translation
                    )
                ):
                    delete query.where.or;
                    query.where.translation = false;
                    delete query.where.priority;
                    break;
                default:
                    break;
            }

            delete query.where.type;

            vm.patents = await PatentService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();