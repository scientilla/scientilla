(function () {
    'use strict';

    angular.module('profile')
        .component('profileCertificateForm', {
            templateUrl: 'partials/profile-certificate-form.html',
            controller: profileCertificateForm,
            controllerAs: 'vm',
            bindings: {
                index: '<',
                profile: '<',
                certificate: '<',
                key: '<',
            }
        });

    profileCertificateForm.$inject = ['ProfileService'];

    function profileCertificateForm(ProfileService) {
        const vm = this;

        vm.dateCertificateDatePopups = [];
        vm.datePickerOptions = [];

            vm.$onInit = function () {
            vm.context = 'certificates[' + vm.key + ']';
            vm.datePickerOptions = ProfileService.getDatepickerOptions();
        };

        vm.removeItem = options => {
            ProfileService.removeItem(options);
        };

        vm.getTooltipText = () => {
            return ProfileService.getFavoriteTooltipText();
        };

        vm.moveUp = function(key, certificate) {
            if (key > 0) {
                vm.profile.certificates.splice(key, 1);
                vm.profile.certificates.splice(key - 1, 0, certificate);
            }
        };

        vm.moveDown = function(key, certificate) {
            if (key < vm.profile.certificates.length) {
                vm.profile.certificates.splice(key, 1);
                vm.profile.certificates.splice(key + 1, 0, certificate);
            }
        };
    }

})();