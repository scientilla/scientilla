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

    controller.$inject = ['GroupsService', 'ModalService', 'ProjectService', 'context'];

    function controller(GroupsService, ModalService, ProjectService, context) {

        const vm = this;
        vm.openDetails = openDetails;
        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;
        vm.isPublic = isPublic;
        vm.isFavorite = isFavorite;
        vm.isPrivacyToShow = isPrivacyToShow;
        vm.isFavoriteToShow = isFavoriteToShow;
        vm.changePrivacy = changePrivacy;
        vm.changeFavorite = changeFavorite;

        const subResearchEntity = context.getSubResearchEntity();

        vm.$onInit = function () {};

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
            const authorship = getAuthorship();
            if (authorship.favorite)
                return ModalService.alert('Project visibility error', 'A favorite project cannot be set to private.');

            authorship.public = !authorship.public;
            ProjectService.setAuthorshipPrivacy(authorship);
        }

        function changeFavorite() {
            const authorship = getAuthorship();
            if (!authorship.public)
                return ModalService.alert('Favorite error', 'A favorite project should be first set to public.');

            authorship.favorite = !authorship.favorite;
            ProjectService.setAuthorshipFavorite(authorship);
        }

        function isPublic() {
            const authorship = getAuthorship();
            if (!authorship) return false;
            return !!authorship.public;
        }

        function isFavorite() {
            const authorship = getAuthorship();
            if (!authorship) return false;
            return !!authorship.favorite;
        }

        function isPrivacyToShow() {
            return getAuthorship();
        }

        function isFavoriteToShow() {
            return getAuthorship();
        }

        function getAuthorship() {
            let field = 'verifiedGroups';
            if (subResearchEntity.getType() === 'user') {
                field = 'verifiedUsers';
            }

            return vm.project[field].find(a => a.researchEntity === subResearchEntity.researchEntity);
        }
    }
})();