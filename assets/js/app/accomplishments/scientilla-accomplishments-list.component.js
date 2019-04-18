/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaAccomplishmentsList', {
            templateUrl: 'partials/scientilla-accomplishments-list.html',
            controller: scientillaAccomplishmentsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                section: '<'
            }
        });

    scientillaAccomplishmentsList.$inject = [
        'AccomplishmentService',
        'EventsService',
        'accomplishmentListSections',
        'AuthService',
        'ResearchItemService'
    ];

    function scientillaAccomplishmentsList(AccomplishmentService,
                                           EventsService,
                                           accomplishmentListSections,
                                           AuthService,
                                           ResearchItemService) {
        const vm = this;

        vm.accomplishments = [];
        vm.unverify = AccomplishmentService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
        vm.onFilter = onFilter;

        let query = {};

        vm.$onInit = function () {
            vm.editable = vm.section === accomplishmentListSections.VERIFIED && !AuthService.user.isViewOnly();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            return onFilter(query);
        }

        /* jshint ignore:start */
        async function onFilter(q) {
            query = q;
            vm.accomplishments = await AccomplishmentService.get(vm.researchEntity, query);
        }
        /* jshint ignore:end */
    }

})();