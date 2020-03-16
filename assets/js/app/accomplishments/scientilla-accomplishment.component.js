/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaAccomplishment', {
            templateUrl: 'partials/scientilla-accomplishment.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                accomplishment: '<',
                section: '<'
            }
        });

    controller.$inject = [
        'context',
        'ResearchEntitiesService',
        'AccomplishmentService',
        'accomplishmentListSections',
        'ModalService',
        'accomplishmentEventTypes',
        'CustomizeService'
    ];

    function controller(context,
                        ResearchEntitiesService,
                        AccomplishmentService,
                        accomplishmentListSections,
                        ModalService,
                        accomplishmentEventTypes,
                        CustomizeService) {
        const vm = this;
        vm.isValid = AccomplishmentService.isValid;
        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;
        vm.hasMainGroupAffiliation = hasMainGroupAffiliation;
        vm.openDetails = openDetails;
        vm.isPublic = isPublic;
        vm.isFavorite = isFavorite;
        vm.changePrivacy = changePrivacy;
        vm.changeFavorite = changeFavorite;

        let researchEntity;

        vm.showPrivacy = [
            accomplishmentListSections.VERIFIED
        ].includes(vm.section);

        vm.collapsed = true;


        /* jshint ignore:start */
        vm.$onInit = async function () {
            researchEntity = await context.getResearchEntity();

            const eventType = accomplishmentEventTypes.find(aet => aet.key === vm.accomplishment.eventType);
            vm.eventTypeLabel = eventType ? eventType.label : undefined;

            vm.customizations = await CustomizeService.getCustomizations();
        };

        /* jshint ignore:end */
        function openDetails() {
            ModalService.openScientillaResearchItemDetails(vm.accomplishment, 'accomplishment');
        }

        function getVerifiedNamesHTML() {
            const verifiedNames = getVerfiedNames();
            if (!verifiedNames.length)
                return 'Nobody has verified this document yet';

            return '<p>This document is verified by:</p><p>' + verifiedNames.join('<br>') + '</p>';
        }

        function hasMainGroupAffiliation() {
            return vm.accomplishment.institutes.find(i => i.id === 1);
        }

        function getVerfiedNames() {
            return vm.accomplishment.verifiedGroups.map(g => '- <b>' + g.name + '</b>')
                .concat(vm.accomplishment.verifiedUsers.map(a => '- ' + a.name + ' ' + a.surname));
        }

        function changePrivacy() {
            const verify = getVerify();
            if (verify.favorite)
                return ModalService.alert('Accomplishment visibility error', 'A favorite accomplishment cannot be set to private.');

            verify.public = !verify.public;
            return ResearchEntitiesService.setVerifyPrivacy(researchEntity, vm.accomplishment, verify);
        }

        function changeFavorite() {
            const verify = getVerify();
            if (!verify.public)
                return ModalService.alert('Favorite error', 'A private accomplishment cannot be set to favorite.');

            verify.favorite = !verify.favorite;
            return ResearchEntitiesService.setVerifyFavorite(researchEntity, vm.accomplishment, verify);
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
            return vm.accomplishment.verified.find(v => v.researchEntity === researchEntity.id);
        }

    }


})();