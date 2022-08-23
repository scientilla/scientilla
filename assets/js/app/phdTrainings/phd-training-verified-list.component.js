/* global angular */
(function () {
    'use strict';

    angular.module('phdTrainings')
        .component('phdTrainingVerifiedList', {
            templateUrl: 'partials/phd-training-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'PhdTrainingService',
        'EventsService',
        'phdTrainingListSections',
        'AuthService',
        'ResearchItemService',
        'ResearchItemTypesService'
    ];

    function controller(
        context,
        PhdTrainingService,
        EventsService,
        phdTrainingListSections,
        AuthService,
        ResearchItemService,
        ResearchItemTypesService
    ) {
        const vm = this;

        vm.phdTrainingListSections = phdTrainingListSections;
        vm.phdTrainings = [];
        vm.unverify = PhdTrainingService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
        vm.onFilter = onFilter;
        vm.exportDownload = phdTrainings => PhdTrainingService.exportDownload(phdTrainings, 'csv');

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
            var favorites = q.where.favorites;
            delete q.where.favorites;
            // Todo favorites

            query = q;

            if (query && query.where && query.where.type) {
                const types = await ResearchItemTypesService.getTypes();
                const type = types.find(type => type.key === query.where.type);
                query.where.type = type.id;
            }

            vm.phdTrainings = await PhdTrainingService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();
