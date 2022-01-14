/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaProject', {
            templateUrl: 'partials/scientilla-project.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                project: '<',
                section: '<'
            }
        });

    controller.$inject = [
        'GroupsService',
        'ModalService',
        'context',
        'EventsService',
        'CustomizeService',
        'ResearchEntitiesService',
        'projectListSections'
    ];

    function controller(
        GroupsService,
        ModalService,
        context,
        EventsService,
        CustomizeService,
        ResearchEntitiesService,
        projectListSections
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
        vm.projectTypeCompetitive = projectTypeCompetitive;
        vm.projectTypeIndustrial = projectTypeIndustrial;

        let researchEntity;

        vm.showPrivacy = [
            projectListSections.VERIFIED
        ].includes(vm.section);

        vm.showFavorite = [
            projectListSections.VERIFIED
        ].includes(vm.section);

        /* jshint ignore:start */
        vm.$onInit = async function () {
            researchEntity = await context.getResearchEntity();

            if (vm.project.type.key === projectTypeIndustrial) {
                switch (true) {
                    case moment(vm.project.startDate, 'YYYY-MM-DD') > moment():
                        vm.status = 'not started';
                        break;
                    case moment(vm.project.startDate, 'YYYY-MM-DD') < moment() && moment(vm.project.endDate, 'YYYY-MM-DD') > moment():
                        vm.status = 'working';
                        break;
                    case moment(vm.project.endDate, 'YYYY-MM-DD') < moment():
                        vm.status = 'ended';
                        break;
                    default:
                        break;
                }
            }

            vm.project.category = industrialProjectCategories[vm.project.category];
            vm.project.payment = industrialProjectPayments[vm.project.payment];

            EventsService.subscribe(vm, EventsService.CUSTOMIZATIONS_CHANGED, function (event, customizations) {
                vm.customizations = customizations;
            });

            CustomizeService.getCustomizations().then(customizations => {
                vm.customizations = customizations;
            });
        };
        /* jshint ignore:end */

        vm.getTypeTitle = GroupsService.getTypeTitle;

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
