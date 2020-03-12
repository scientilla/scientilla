(function () {
    'use strict';

    angular.module('profile')
        .component('profileSkillForm', {
            templateUrl: 'partials/profile-skill-form.html',
            controller: profileSkillForm,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                categoryKey: '<',
                skill: '<',
                key: '<',
            }
        });

    profileSkillForm.$inject = ['ProfileService'];

    function profileSkillForm(ProfileService) {
        const vm = this;

        vm.$onInit = function () {
            vm.context = 'skill[' + vm.categoryKey + '][' + vm.key + ']';
        };

        vm.removeItem = options => {
            ProfileService.removeItem(options);
        };

        vm.getTooltipText = () => {
            return ProfileService.getFavoriteTooltipText();
        };
    }

})();