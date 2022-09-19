/* global angular */
(function () {
    'use strict';

    angular.module('trainingModules')
        .component('trainingModuleSuggestedList', {
            templateUrl: 'partials/training-module-suggested-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'trainingModuleService',
        'trainingModuleListSections',
        'EventsService',
        'ModalService'
    ];

    function controller(context, trainingModuleService, trainingModuleListSections, EventsService, ModalService) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = trainingModuleService.isValid;

        vm.verify = (trainingModule) => trainingModuleService.verify(vm.researchEntity, trainingModule);
        vm.discard = (trainingModule) => trainingModuleService.discard(vm.researchEntity, trainingModule);
        vm.copy = (trainingModule) => trainingModuleService.copy(vm.researchEntity, trainingModule);
        vm.multipleVerify = (trainingModules) => trainingModuleService.multipleVerify(vm.researchEntity, trainingModules);
        vm.multipleDiscard = (trainingModules) => trainingModuleService.multipleDiscard(vm.researchEntity, trainingModules);
        vm.multipleCopy = (trainingModules) => trainingModuleService.multipleCopy(vm.researchEntity, trainingModules);
        vm.trainingModuleListSections = trainingModuleListSections;

        let query = {};

        /* jshint ignore:start */
        vm.$onInit = async function () {
            const subResearchEntity = await context.getSubResearchEntity();
            vm.researchEntity = await context.getResearchEntity();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED,
                EventsService.RESEARCH_ITEM_DISCARDED,
            ], updateList);

            if (subResearchEntity.getType() === 'user' && !subResearchEntity.alreadyOpenedSuggested) {
                ModalService.openWizard(['alias-edit'], {
                    isClosable: true,
                    size: 'lg'
                });
                subResearchEntity.alreadyOpenedSuggested = true;
                subResearchEntity.save();
            }
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            return onFilter(query);
        }

        async function onFilter(q) {
            query = q;

            if (!vm.researchEntity)
                vm.researchEntity = await context.getResearchEntity();

            const isDiscarded = q.where.discarded;
            const cq = _.cloneDeep(q);
            delete cq.where.discarded;
            if (isDiscarded)
                vm.trainingModules = await trainingModuleService.getDiscarded(vm.researchEntity, cq);
            else
                vm.trainingModules = await trainingModuleService.getSuggested(vm.researchEntity, cq);

        }

        /* jshint ignore:end */

    }

})();
