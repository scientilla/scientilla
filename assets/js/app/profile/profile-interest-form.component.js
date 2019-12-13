(function () {
    'use strict';

    angular.module('profile')
        .component('profileInterestForm', {
            templateUrl: 'partials/profile-interest-form.html',
            controller: profileInterestForm,
            controllerAs: 'vm',
            bindings: {
                errors: '<',
                profile: '<',
                interest: '<',
                key: '<',
                removeItem: '<'
            }
        });

    profileInterestForm.$inject = ['ProfileService'];

    function profileInterestForm(ProfileService) {
        const vm = this;

        vm.$onInit = function () {
            vm.context = 'interests[' + vm.key + ']';
        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };
    }

})();