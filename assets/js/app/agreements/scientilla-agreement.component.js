/* global angular */
(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreement', {
            templateUrl: 'partials/scientilla-agreement.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                agreement: '<',
                section: '<'
            }
        });

    controller.$inject = [
        'GroupsService',
        'ModalService',
        'AgreementService',
        'context',
        'EventsService',
        'CustomizeService',
        'ResearchEntitiesService',
        'agreementListSections'
    ];

    function controller(
        GroupsService,
        ModalService,
        AgreementService,
        context,
        EventsService,
        CustomizeService,
        ResearchEntitiesService,
        agreementListSections
    ) {

        const vm = this;
        vm.openDetails = openDetails;
        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;
        vm.isPublic = isPublic;
        vm.isFavorite = isFavorite;
        vm.isPrivacyToShow = isPrivacyToShow;
        vm.isFavoriteToShow = isFavoriteToShow;
        vm.changePrivacy = changePrivacy;
        vm.changeFavorite = changeFavorite;
        vm.hasIITAsPartner = hasIITAsPartner;

        let researchEntity;

        vm.showPrivacy = [
            agreementListSections.VERIFIED
        ].includes(vm.section);

        vm.showFavorite = [
            agreementListSections.VERIFIED
        ].includes(vm.section);

        /* jshint ignore:start */
        vm.$onInit = async function () {
            researchEntity = await context.getResearchEntity();

            EventsService.subscribe(vm, EventsService.CUSTOMIZATIONS_CHANGED, function (event, customizations) {
                vm.customizations = customizations;
            });

            CustomizeService.getCustomizations().then(customizations => {
                vm.customizations = customizations;
            });
        };
        /* jshint ignore:end */

        vm.getTypeTitle = GroupsService.getTypeTitle;

        vm.lines = _.uniq(vm.agreement.lines.map(line => line.description));

        function openDetails() {
            ModalService
                .openAgreementDetails(vm.agreement);
        }

        function getVerifiedNamesHTML() {
            const verifiedNames = getVerfiedNames();
            if (!verifiedNames.length)
                return 'Nobody has verified this agreement yet';

            return '<p>This agreement is verified by:</p><p>' + verifiedNames.join('<br>') + '</p>';
        }

        function getVerfiedNames() {
            return vm.agreement.verifiedGroups.map(g => '- <strong>' + g.name + '</strong>')
                .concat(vm.agreement.verifiedUsers.map(a =>  '- ' + a.getDisplayName()));
        }

        function changePrivacy() {
            const verify = getVerify();
            if (verify.favorite)
                return ModalService.alert('Agreement visibility error', 'A favorite agreement cannot be set to private.');

            verify.public = !verify.public;
            return ResearchEntitiesService.setVerifyPrivacy(researchEntity, vm.agreement, verify);
        }

        function changeFavorite() {
            const verify = getVerify();
            if (!verify.public)
                return ModalService.alert('Favorite error', 'A favorite agreement should be first set to public.');

            verify.favorite = !verify.favorite;
            return ResearchEntitiesService.setVerifyFavorite(researchEntity, vm.agreement, verify);
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
            return vm.agreement.verified.find(v => v.researchEntity === researchEntity.id);
        }
    }
})();