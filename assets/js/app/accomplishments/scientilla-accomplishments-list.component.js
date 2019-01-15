(function () {
    'use strict';

    angular.module('accomplishments')
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
        'context',
        'researchEntityService',
        'accomplishmentSearchForm',
        'EventsService',
        'accomplishmentListSections',
        'AuthService'
    ];

    function scientillaAccomplishmentsList(
        context,
        researchEntityService,
        accomplishmentSearchForm,
        EventsService,
        accomplishmentListSections,
        AuthService
    ) {
        const vm = this;

        const AccomplishmentService = context.getAccomplishmentService();

        vm.accomplishments = [];

        vm.unverifyAccomplishment = AccomplishmentService.unverifyAccomplishment; // Remove?

        vm.onFilter = onFilter;

        vm.searchForm = accomplishmentSearchForm;

        let query = {};

        vm.$onInit = function () {
            vm.editable = vm.section === accomplishmentListSections.VERIFIED && !AuthService.user.isViewOnly();

            EventsService.subscribeAll(vm, [
                EventsService.ACCOMPLISHMENT_DRAFT_VERIFIED,
                EventsService.ACCOMPLISHMENT_DRAFT_UNVERIFIED // Remove?
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            onFilter(query);
        }

        function onFilter(q) {
            query = q;

            return researchEntityService.accomplishment.getAccomplishments(vm.researchEntity, query)
                .then(function (accomplishments) {
                    vm.accomplishments = accomplishments;
                });
        }
    }

})();