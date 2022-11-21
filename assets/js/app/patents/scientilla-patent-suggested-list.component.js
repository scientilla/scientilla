/* global angular */
(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatentSuggestedList', {
            templateUrl: 'partials/scientilla-patent-suggested-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'PatentService',
        'patentListSections',
        'EventsService',
        'ModalService'
    ];

    function controller(context, PatentService, patentListSections, EventsService, ModalService) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = PatentService.isValid;

        vm.verify = (patent) => PatentService.verify(vm.researchEntity, patent);
        vm.discard = (patent) => PatentService.discard(vm.researchEntity, patent);
        vm.multipleVerify = (patents) => PatentService.multipleVerify(vm.researchEntity, patents);
        vm.multipleDiscard = (patents) => PatentService.multipleDiscard(vm.researchEntity, patents);
        vm.patentListSections = patentListSections;

        let query = {
            where: {}
        };

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
            let tmpQuery = _.cloneDeep(q);
            delete tmpQuery.where.discarded;

            tmpQuery = PatentService.handleQuery(tmpQuery);

            if (isDiscarded) {
                vm.patents = await PatentService.getDiscarded(vm.researchEntity, tmpQuery);
            } else {
                vm.patents = await PatentService.getSuggested(vm.researchEntity, tmpQuery);
            }
        }
        /* jshint ignore:end */
    }

})();
