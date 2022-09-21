/* global angular */
(function () {
    'use strict';

    angular.module('trainingModules')
        .component('trainingModulesList', {
            templateUrl: 'partials/training-modules-list.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                section: '<',
                active: '<?'
            }
        });

    controller.$inject = [
        'trainingModuleService',
        'EventsService',
        'trainingModuleListSections',
        'AuthService',
        'ResearchItemService',
        'ResearchItemTypesService',
        '$element',
        '$scope'
    ];

    function controller(
        trainingModuleService,
        EventsService,
        trainingModuleListSections,
        AuthService,
        ResearchItemService,
        ResearchItemTypesService,
        $element,
        $scope
    ) {
        const vm = this;

        vm.name = 'training-modules-list';
        vm.shouldBeReloaded = true;

        vm.trainingModules = [];
        vm.unverify = trainingModuleService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
        vm.onFilter = onFilter;
        vm.exportDownload = trainingModules => trainingModuleService.exportDownload(trainingModules, 'csv');

        let query = {};
        let activeWatcher;

        vm.loadTrainingModules = true;

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            if (_.has(vm, 'active')) {
                vm.loadTrainingModules = angular.copy(vm.active);

                activeWatcher = $scope.$watch('vm.active', () => {
                    vm.loadTrainingModules = angular.copy(vm.active);

                    if (vm.loadTrainingModules) {
                        $scope.$broadcast('filter');
                    } else {
                        vm.trainingModules = [];
                    }
                });
            }
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);

            EventsService.unsubscribeAll(vm);

            if (_.isFunction(activeWatcher)) {
                activeWatcher();
            }
        };

        vm.reload = function () {
            EventsService.unsubscribeAll(vm);

            vm.editable = vm.section === trainingModuleListSections.VERIFIED && !AuthService.user.isViewOnly();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED
            ], updateList);
        };

        function updateList() {
            return onFilter(query);
        }

        /* jshint ignore:start */
        async function onFilter(q) {
            query = q;
            if (query && query.where && query.where.type) {
                const types = await ResearchItemTypesService.getTypes();
                const type = types.find(type => type.key === query.where.type);
                query.where.type = type.id;
            }

            return trainingModuleService.get(vm.researchEntity, query)
                .then(trainingModules => {
                    vm.trainingModules = trainingModules;
                });
        }
        /* jshint ignore:end */
    }

})();
