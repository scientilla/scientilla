/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaProject', {
            templateUrl: 'partials/scientilla-project.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                project: '<'
            }
        });

    controller.$inject = [
        'GroupsService',
        'ModalService',
        'ProjectService',
        'context',
        'EventsService',
        'CustomizeService',
        'ResearchEntitiesService'
    ];

    function controller(
        GroupsService,
        ModalService,
        ProjectService,
        context,
        EventsService,
        CustomizeService,
        ResearchEntitiesService
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

        vm.lines = _.uniq(vm.project.lines.map(line => line.description));

        function openDetails() {
            ModalService
                .openProjectDetails(vm.project);
        }

        function getVerifiedNamesHTML() {
            const verifiedNames = getVerfiedNames();
            if (!verifiedNames.length)
                return 'Nobody has verified this project yet';

            return '<p>This project is verified by:</p><p>' + verifiedNames.join('<br>') + '</p>';
        }

        function getVerfiedNames() {
            return vm.project.verifiedGroups.map(g => '- <strong>' + g.name + '</strong>')
                .concat(vm.project.verifiedUsers.map(a =>  '- ' + a.getDisplayName()));
        }

        function changePrivacy() {
            const verify = getVerify();
            if (verify.favorite)
                return ModalService.alert('Project visibility error', 'A favorite project cannot be set to private.');

            verify.public = !verify.public;
            return ResearchEntitiesService.setVerifyPrivacy(researchEntity, vm.project, verify);
        }

        function changeFavorite() {
            const verify = getVerify();
            if (!verify.public)
                return ModalService.alert('Favorite error', 'A favorite project should be first set to public.');

            verify.favorite = !verify.favorite;
            return ResearchEntitiesService.setVerifyFavorite(researchEntity, vm.project, verify);
        }

        function isPrivacyToShow() {
            return getVerify();
        }

        function isFavoriteToShow() {
            return getVerify();
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
            return vm.project.verified.find(v => v.researchEntity === researchEntity.id);
        }

        function hasIITAsPartner() {
            if (_.has(vm, 'project.projectData.partners')) {
                const partners = vm.project.projectData.partners;
                return !_.isEmpty(partners.filter(p => p.description === 'Fondazione Istituto Italiano di Tecnologia'));
            }

            return false;
        }
    }
})();