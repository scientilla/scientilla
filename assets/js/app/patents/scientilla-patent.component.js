/* global angular */
(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatent', {
            templateUrl: 'partials/scientilla-patent.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                patent: '<',
                section: '<'
            }
        });

    controller.$inject = [
        'GroupsService',
        'ModalService',
        'DateService',
        'patentListSections',
        'ResearchEntitiesService',
        'CustomizeService'
    ];

    function controller(
        GroupsService,
        ModalService,
        DateService,
        patentListSections,
        ResearchEntitiesService,
        CustomizeService
    ) {

        const vm = this;

        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;
        vm.openDetails = openDetails;
        vm.format = DateService.format;

        vm.isPublic = isPublic;
        vm.isFavorite = isFavorite;
        vm.isPrivacyToShow = isPrivacyToShow;
        vm.isFavoriteToShow = isFavoriteToShow;
        vm.changePrivacy = changePrivacy;
        vm.changeFavorite = changeFavorite;
        vm.hasMainGroupAffiliation = hasMainGroupAffiliation;

        vm.collapsed = true;

        vm.showPrivacy = [
            patentListSections.VERIFIED
        ].includes(vm.section);

        vm.showFavorite = [
            patentListSections.VERIFIED
        ].includes(vm.section);

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.customizations = await CustomizeService.getCustomizations();
        };
        /* jshint ignore:end */

        function openDetails() {
            ModalService
                .openPatentDetails(vm.patent);
        }

        function getVerfiedNames() {
            return vm.patent.verifiedGroups.map(g => '- <strong>' + g.name + '</strong>')
                .concat(vm.patent.verifiedUsers.map(a =>  '- ' + a.getDisplayName()));
        }

        function getVerifiedNamesHTML() {
            const verifiedNames = getVerfiedNames();
            if (!verifiedNames.length)
                return 'Nobody has verified this project yet';

            return '<p>This patent is verified by:</p><p>' + verifiedNames.join('<br>') + '</p>';
        }

        function hasMainGroupAffiliation() {
            return vm.patent.institutes.find(i => i.id === 1);
        }

        function changePrivacy() {
            const verify = getVerify();
            if (verify.favorite)
                return ModalService.alert('Patent visibility error', 'A favorite patent cannot be set to private.');

            verify.public = !verify.public;
            return ResearchEntitiesService.setVerifyPrivacy(vm.researchEntity, vm.patent, verify);
        }

        function changeFavorite() {
            const verify = getVerify();
            if (!verify.public)
                return ModalService.alert('Favorite error', 'A private patent cannot be set to favorite.');

            verify.favorite = !verify.favorite;
            return ResearchEntitiesService.setVerifyFavorite(vm.researchEntity, vm.patent, verify);
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
            return vm.patent.verified.find(v => v.researchEntity === vm.researchEntity.id);
        }
    }
})();
