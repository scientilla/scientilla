/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaAccomplishmentSuggestedList', {
            templateUrl: 'partials/scientilla-accomplishment-suggested-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'AccomplishmentService',
        'accomplishmentListSections',
        'EventsService',
        'ModalService'
    ];

    function controller(context, AccomplishmentService, accomplishmentListSections, EventsService, ModalService) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = AccomplishmentService.isValid;

        vm.verify = (accomplishment) => AccomplishmentService.verify(vm.researchEntity, accomplishment);
        vm.discard = (accomplishment) => AccomplishmentService.discard(vm.researchEntity, accomplishment);
        vm.copy = (accomplishment) => AccomplishmentService.copy(vm.researchEntity, accomplishment);
        vm.multipleVerify = (accomplishments) => AccomplishmentService.multipleVerify(vm.researchEntity, accomplishments);
        vm.multipleDiscard = (accomplishments) => AccomplishmentService.multipleDiscard(vm.researchEntity, accomplishments);
        vm.multipleCopy = (accomplishments) => AccomplishmentService.multipleCopy(vm.researchEntity, accomplishments);
        vm.accomplishmentListSections = accomplishmentListSections;

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
            const qq = _.cloneDeep(q);
            delete qq.where.discarded;
            if (isDiscarded)
                vm.accomplishments = await AccomplishmentService.getDiscarded(vm.researchEntity, qq);
            else
                vm.accomplishments = await AccomplishmentService.getSuggested(vm.researchEntity, qq);

        }

        /* jshint ignore:end */

    }

})();