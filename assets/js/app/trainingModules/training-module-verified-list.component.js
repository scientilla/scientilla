/* global angular */
(function () {
    'use strict';

    angular.module('trainingModules')
        .component('trainingModuleVerifiedList', {
            templateUrl: 'partials/training-module-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'trainingModuleService',
        'EventsService',
        'trainingModuleListSections',
        'AuthService',
        'ResearchItemService',
        'ResearchItemTypesService'
    ];

    function controller(
        context,
        trainingModuleService,
        EventsService,
        trainingModuleListSections,
        AuthService,
        ResearchItemService,
        ResearchItemTypesService
    ) {
        const vm = this;

        vm.trainingModuleListSections = trainingModuleListSections;
        vm.trainingModules = [];
        vm.unverify = trainingModuleService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
        vm.onFilter = onFilter;
        vm.exportExcelDownload = trainingModules => trainingModuleService.exportDownload(trainingModules, 'excel');
        vm.exportDownload = trainingModules => trainingModuleService.exportDownload(trainingModules, 'csv');

        let query = {};

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            vm.editable = !AuthService.user.isViewOnly();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED
            ], updateList);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
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

            vm.trainingModules = await trainingModuleService.get(vm.researchEntity, query);
        }
        /* jshint ignore:end */
    }

})();
