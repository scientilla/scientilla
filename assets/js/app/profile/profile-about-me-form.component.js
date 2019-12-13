(function () {
    'use strict';

    angular.module('profile')
        .component('profileAboutMeForm', {
            templateUrl: 'partials/profile-about-me-form.html',
            controller: profileAboutMeForm,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                errors: '<',
            }
        });

    profileAboutMeForm.$inject = ['ProfileService'];

    function profileAboutMeForm(ProfileService) {
        const vm = this;

        vm.$onInit = function () {

        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.addItem = (options) => {
            ProfileService.addItem(options);
        };
    }

})();