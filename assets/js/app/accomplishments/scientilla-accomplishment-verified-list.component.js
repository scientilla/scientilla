/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaAccomplishmentVerifiedList', {
            templateUrl: 'partials/scientilla-accomplishment-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'context',
        'AccomplishmentService',
        'EventsService',
        'accomplishmentListSections',
        'AuthService',
        'ResearchItemService',
        'ResearchItemTypesService'
    ];

    function controller(context,
                        AccomplishmentService,
                        EventsService,
                        accomplishmentListSections,
                        AuthService,
                        ResearchItemService,
                        ResearchItemTypesService) {
        const vm = this;

        vm.accomplishmentListSections = accomplishmentListSections;
        vm.accomplishments = [];
        vm.unverify = AccomplishmentService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
        vm.onFilter = onFilter;
        vm.exportDownload = accomplishments => AccomplishmentService.exportDownload(accomplishments, 'csv');

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

            vm.accomplishments = await AccomplishmentService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();