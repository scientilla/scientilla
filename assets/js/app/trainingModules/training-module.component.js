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
        'ResearchEntitiesService',
        'trainingModuleService',
        'trainingModuleListSections',
        'ModalService',
        'CustomizeService'
    ];

    function controller(
        context,
        ResearchEntitiesService,
        trainingModuleService,
        trainingModuleListSections,
        ModalService,
        CustomizeService
    ) {
        const vm = this;
        vm.isValid = trainingModuleService.isValid;
        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;
        vm.openDetails = openDetails;
        vm.isPublic = isPublic;
        vm.isFavorite = isFavorite;
        vm.changePrivacy = changePrivacy;
        vm.changeFavorite = changeFavorite;
        vm.isPrivacyToShow = isPrivacyToShow;
        vm.isFavoriteToShow = isFavoriteToShow;

        let researchEntity;

        vm.showPrivacy = [
            trainingModuleListSections.VERIFIED
        ].includes(vm.section);

        vm.showFavorite = [
            trainingModuleListSections.VERIFIED
        ].includes(vm.section);

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
                return 'Nobody has verified this PhD Training yet';

            return '<p>This PhD training is verified by:</p><p>' + verifiedNames.join('<br>') + '</p>';
        }

        function getVerfiedNames() {
            return vm.trainingModule.verifiedGroups.map(g => '- <b>' + g.name + '</b>')
                .concat(vm.trainingModule.verifiedUsers.map(p => '- ' + p.getDisplayName()));
        }

        function changePrivacy() {
            const verify = getVerify();
            if (verify.favorite)
                return ModalService.alert('PhD training visibility error', 'A favorite PhD training cannot be set to private.');

            verify.public = !verify.public;
            return ResearchEntitiesService.setVerifyPrivacy(researchEntity, vm.trainingModule, verify);
        }

        function changeFavorite() {
            const verify = getVerify();
            if (!verify.public)
                return ModalService.alert('Favorite error', 'A private PhD training cannot be set to favorite.');

            verify.favorite = !verify.favorite;
            return ResearchEntitiesService.setVerifyFavorite(researchEntity, vm.trainingModule, verify);
        }

        function isPrivacyToShow() {
            return vm.showPrivacy && getVerify();
        }

        function isFavoriteToShow() {
            return vm.showFavorite && getVerify();
        }

        function isPublic() {
            const verify = getVerify();
            if (!verify) return false;
            return verify.public;
        }

        function isFavorite() {
            const verify = getVerify();
            if (!verify) return false;
            return verify.favorite;
        }

        function getVerify() {
            if (!researchEntity)
                return;
            return vm.trainingModule.verified.find(v => v.researchEntity === researchEntity.id);
        }
    }
})();
