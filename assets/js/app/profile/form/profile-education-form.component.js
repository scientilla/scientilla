(function () {
    'use strict';

    angular.module('profile')
        .component('profileEducationForm', {
            templateUrl: 'partials/profile-education-form.html',
            controller: profileEducationForm,
            controllerAs: 'vm',
            bindings: {
                index: '<',
                profile: '<',
                education: '<',
                key: '<',
            }
        });

    profileEducationForm.$inject = ['ProfileService'];

    function profileEducationForm(ProfileService) {
        const vm = this;

        vm.dateEducationFromPopups = [];
        vm.dateEducationToPopups = [];
        vm.datePickerOptions = [];

        vm.$onInit = function () {
            vm.context = 'education[' + vm.key + ']';
            vm.datePickerOptions = ProfileService.getDatepickerOptions();
        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.moveUp = function(key, education) {
            if (key > 0) {
                vm.profile.education.splice(key, 1);
                vm.profile.education.splice(key - 1, 0, education);
            }
        };

        vm.moveDown = function(key, education) {
            if (key < vm.profile.education.length) {
                vm.profile.education.splice(key, 1);
                vm.profile.education.splice(key + 1, 0, education);
            }
        };
    }

})();