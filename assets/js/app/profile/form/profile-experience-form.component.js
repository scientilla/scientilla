(function () {
    'use strict';

    angular.module('profile')
        .component('profileExperienceForm', {
            templateUrl: 'partials/profile-experience-form.html',
            controller: profileExperienceForm,
            controllerAs: 'vm',
            bindings: {
                index: '<',
                profile: '<',
                experience: '<',
                key: '<',
            }
        });

    profileExperienceForm.$inject = ['ProfileService'];

    function profileExperienceForm(ProfileService) {
        const vm = this;

        vm.dateExperienceFromPopups = [];
        vm.dateExperienceToPopups = [];
        vm.datePickerOptions = [];

        vm.$onInit = function () {
            vm.context = 'experiences[' + vm.key + ']';
            vm.datePickerOptions = ProfileService.getDatepickerOptions();
        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.moveUp = function(key, experience) {
            if (key > 0) {
                vm.profile.experiences.splice(key, 1);
                vm.profile.experiences.splice(key - 1, 0, experience);
            }
        };

        vm.moveDown = function(key, experience) {
            if (key < vm.profile.experiences.length) {
                vm.profile.experiences.splice(key, 1);
                vm.profile.experiences.splice(key + 1, 0, experience);
            }
        };
    }

})();