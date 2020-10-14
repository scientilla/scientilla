(function () {
    'use strict';

    angular.module('profile')
        .component('profileExportBlock', {
            templateUrl: 'partials/profile-export-block.html',
            controller: profileExportBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileExportBlock.$inject = ['ProfileService', 'TextService', 'AuthService'];

    function profileExportBlock(ProfileService, TextService, AuthService) {
        const vm = this;

        vm.exportOptions = {
            basic: true,
            socials: true,
            about: true,
            experiences: true,
            education: true,
            certificates: true,
            skills: true,
            documents: true,
            accomplishments: true,
            invitedTalks: true
        };

        vm.$onInit = function () {
            vm.user = AuthService.user;
        };

        vm.joinstrings = (strings, seperator) => {
            return TextService.joinStrings(strings, seperator);
        };

        vm.isExporting = {
            doc: false,
            pdf: false
        };

        /* jshint ignore:start */
        vm.exportProfile = async (type) => {
            vm.isExporting[type] = true;
            const data = await ProfileService.exportProfile(AuthService.user, type, vm.exportOptions);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.href = 'data:application/octet-stream;base64,' + data;

            switch (type) {
                case 'doc':
                    a.download = 'profile.docx';
                    a.click();
                    break;
                case 'pdf':
                    a.download = 'profile.pdf';
                    a.click();
                    break;
                default:
                    break;
            }

            vm.isExporting[type] = false;
        };
        /* jshint ignore:end */
    }

})();