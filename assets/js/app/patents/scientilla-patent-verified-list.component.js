/* global angular */
(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatentVerifiedList', {
            templateUrl: 'partials/scientilla-patent-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'PatentService',
        'patentListSections',
        'context',
        'groupTypes',
        'ResearchItemService',
        'EventsService'
    ];

    function controller(
        PatentService,
        patentListSections,
        context,
        groupTypes,
        ResearchItemService,
        EventsService
    ) {
        const vm = this;

        vm.patentListSections = patentListSections;
        vm.patents = [];
        vm.unverify = PatentService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
        vm.onFilter = onFilter;
        vm.exportExcelDownload = patents => PatentService.exportDownload(patents, 'excel');
        vm.exportDownload = patents => PatentService.exportDownload(patents, 'csv');
        vm.showActions = showActions;

        let query = {
            where: {}
        };

        vm.subResearchEntity = context.getSubResearchEntity();

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();

            EventsService.subscribeAll(vm, [
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
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            query = PatentService.handleQuery(query);

            vm.patents = await PatentService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */

        function showActions() {
            return vm.subResearchEntity.getType() === 'group' && (
                vm.subResearchEntity.type === groupTypes.INITIATIVE ||
                vm.subResearchEntity.type === groupTypes.PROJECT
            );
        }
    }

})();
