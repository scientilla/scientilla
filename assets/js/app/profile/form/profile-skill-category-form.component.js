(function () {
    'use strict';

    angular.module('profile')
        .component('profileSkillCategoryForm', {
            templateUrl: 'partials/profile-skill-category-form.html',
            controller: profileSkillCategoryForm,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                category: '<',
                key: '<',
            }
        });

    profileSkillCategoryForm.$inject = ['ProfileService'];

    function profileSkillCategoryForm(ProfileService) {
        const vm = this;

        vm.$onInit = function () {
            vm.context = 'skill-category[' + vm.key + ']';
        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.addItem = (options) => {
            ProfileService.addItem(options);
        };
    }

})();