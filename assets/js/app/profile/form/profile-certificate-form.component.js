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

    profileCertificateForm.$inject = ['ProfileService', '$scope', 'DateService'];

    function profileCertificateForm(ProfileService, $scope, DateService) {
        const vm = this;

        vm.open = false;
        vm.datePickerOptions = [];
        vm.date = null;

        const watchers = [];

        vm.$onInit = function () {
            vm.context = 'certificates[' + vm.key + ']';
            vm.datePickerOptions = ProfileService.getDatepickerOptions();

            if (typeof vm.certificate.date === 'string') {
                vm.date = DateService.toDate(vm.certificate.date);
            }
        };

        vm.$onDestroy = function () {
            watchers.forEach(watcher => {
                if (_.isFunction(watcher)) {
                    watcher();
                }
            });
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

        vm.changeDate = () => {
            if (!vm.date) {
                return;
            }

            vm.certificate.date = DateService.toOurTimezone(vm.date);
        };
    }

})();