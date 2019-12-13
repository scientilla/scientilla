(function () {
    'use strict';

    angular.module('profile')
        .component('profileEducationForm', {
            templateUrl: 'partials/profile-education-form.html',
            controller: profileEducationForm,
            controllerAs: 'vm',
            bindings: {
                errors: '<',
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
    }

})();