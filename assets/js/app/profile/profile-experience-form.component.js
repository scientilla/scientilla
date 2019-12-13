(function () {
    'use strict';

    angular.module('profile')
        .component('profileExperienceForm', {
            templateUrl: 'partials/profile-experience-form.html',
            controller: profileExperienceForm,
            controllerAs: 'vm',
            bindings: {
                errors: '<',
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
    }

})();