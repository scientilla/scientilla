(function () {
    'use strict';

    angular.module('profile')
        .component('profileInterestForm', {
            templateUrl: 'partials/profile-interest-form.html',
            controller: profileInterestForm,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                index: '<',
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

        vm.moveUp = function(key, interest) {
            if (key > 0) {
                vm.profile.interests.splice(key, 1);
                vm.profile.interests.splice(key - 1, 0, interest);
            }
        };

        vm.moveDown = function(key, interest) {
            if (key < vm.profile.interests.length) {
                vm.profile.interests.splice(key, 1);
                vm.profile.interests.splice(key + 1, 0, interest);
            }
        };
    }

})();