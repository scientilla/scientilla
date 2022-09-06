/* global angular */
(function () {
    'use strict';

    angular.module('phdTrainings')
        .component('phdTrainingSuggestedList', {
            templateUrl: 'partials/phd-training-suggested-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'PhdTrainingService',
        'phdTrainingListSections',
        'EventsService',
        'ModalService'
    ];

    function controller(context, PhdTrainingService, phdTrainingListSections, EventsService, ModalService) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = PhdTrainingService.isValid;

        vm.verify = (phdTraining) => PhdTrainingService.verify(vm.researchEntity, phdTraining);
        vm.discard = (phdTraining) => PhdTrainingService.discard(vm.researchEntity, phdTraining);
        vm.copy = (phdTraining) => PhdTrainingService.copy(vm.researchEntity, phdTraining);
        vm.multipleVerify = (phdTrainings) => PhdTrainingService.multipleVerify(vm.researchEntity, phdTrainings);
        vm.multipleDiscard = (phdTrainings) => PhdTrainingService.multipleDiscard(vm.researchEntity, phdTrainings);
        vm.multipleCopy = (phdTrainings) => PhdTrainingService.multipleCopy(vm.researchEntity, phdTrainings);
        vm.phdTrainingListSections = phdTrainingListSections;

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
            console.log(isDiscarded);
            if (isDiscarded)
                vm.phdTrainings = await PhdTrainingService.getDiscarded(vm.researchEntity, cq);
            else
                vm.phdTrainings = await PhdTrainingService.getSuggested(vm.researchEntity, cq);

        }

        /* jshint ignore:end */

    }

})();
