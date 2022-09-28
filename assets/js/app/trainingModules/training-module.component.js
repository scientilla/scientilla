/* global angular */
(function () {
    'use strict';

    angular.module('trainingModules')
        .component('trainingModule', {
            templateUrl: 'partials/training-module.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                trainingModule: '<',
                section: '<'
            }
        });

    controller.$inject = [
        'context',
        'trainingModuleService',
        'ModalService',
        'CustomizeService'
    ];

    function controller(
        context,
        trainingModuleService,
        ModalService,
        CustomizeService
    ) {
        const vm = this;
        vm.isValid = trainingModuleService.isValid;
        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;
        vm.openDetails = openDetails;
        vm.getNextYear = trainingModuleService.getNextYear;
        vm.hasMainGroupAffiliation = hasMainGroupAffiliation;

        let researchEntity;
        vm.collapsed = true;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            researchEntity = await context.getResearchEntity();
            vm.customizations = await CustomizeService.getCustomizations();
        };

        /* jshint ignore:end */
        function openDetails() {
            ModalService.openScientillaResearchItemDetails(vm.trainingModule, 'training-module');
        }

        function getVerifiedNamesHTML() {
            const verifiedNames = getVerfiedNames();
            if (!verifiedNames.length)
                return 'Nobody has verified this training module yet';

            return '<p>This training module is verified by:</p><p>' + verifiedNames.join('<br>') + '</p>';
        }

        function getVerfiedNames() {
            return vm.trainingModule.verifiedGroups.map(g => '- <b>' + g.name + '</b>')
                .concat(vm.trainingModule.verifiedUsers.map(p => '- ' + p.getDisplayName()));
        }

        function hasMainGroupAffiliation() {
            return vm.trainingModule.institutes.find(i => i.id === 1);
        }
    }
})();
