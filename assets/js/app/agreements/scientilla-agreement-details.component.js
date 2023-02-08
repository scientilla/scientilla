(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementDetails', {
            templateUrl: 'partials/scientilla-agreement-details.html',
            controller: scientillaAgreementDetails,
            controllerAs: 'vm',
            bindings: {
                agreement: "<"
            }
        });

    scientillaAgreementDetails.$inject = [
        'AgreementService',
        'GroupsService',
        'ResearchEntitiesService',
        'EventsService',
        'pathProfileImages'
    ];

    function scientillaAgreementDetails(
        AgreementService,
        GroupsService,
        ResearchEntitiesService,
        EventsService,
        pathProfileImages
    ) {
        const vm = this;
        vm.group = false;
        vm.profile = false;
        vm.pathProfileImages = false;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.agreement.status = AgreementService.getStatus(vm.agreement);
            if (vm.agreement) {
                vm.group = await GroupsService.getGroup(vm.agreement.group);
                vm.pathProfileImages = pathProfileImages + '/' + vm.group.researchEntity;
            }

            if (vm.group) {
                const response = await ResearchEntitiesService.getProfile(vm.group.researchEntity);
                vm.profile = response.plain();
            }

            EventsService.subscribeAll(vm, [
                EventsService.GROUP_PROFILE_SAVED
            ], (evt, profile) => {
                vm.profile = profile;
            });
        };
        /* jshint ignore:end */

        vm.$onDestroy = () => {
            EventsService.unsubscribeAll(vm);
        };

        vm.getTypeLabel = type => {
            const agreementType = agreementTypes.find(t => t.key === type);
            if (agreementType) {
                return agreementType.label;
            }
            return '';
        };
    }

})();
