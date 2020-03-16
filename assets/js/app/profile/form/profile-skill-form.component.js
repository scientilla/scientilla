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

        vm.moveUp = function(key, skill) {
            if (key > 0) {
                vm.profile.skillCategories[vm.categoryKey].skills.splice(key, 1);
                vm.profile.skillCategories[vm.categoryKey].skills.splice(key - 1, 0, skill);
            }
        };

        vm.moveDown = function(key, skill) {
            if (key < vm.profile.skillCategories[vm.categoryKey].skills.length) {
                vm.profile.skillCategories[vm.categoryKey].skills.splice(key, 1);
                vm.profile.skillCategories[vm.categoryKey].skills.splice(key + 1, 0, skill);
            }
        };
    }

})();