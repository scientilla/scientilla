(function () {
    'use strict';

    angular.module('profile')
        .component('profileAboutMeForm', {
            templateUrl: 'partials/profile-about-me-form.html',
            controller: profileAboutMeForm,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileAboutMeForm.$inject = ['ProfileService', 'AuthService', 'pathProfileImages'];

    function profileAboutMeForm(ProfileService, AuthService, pathProfileImages) {
        const vm = this;

        vm.pathProfileImages = pathProfileImages + '/' + AuthService.user.researchEntity + '/';

        vm.$onInit = function () {

        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.addItem = (options) => {
            ProfileService.addItem(options);
        };

        vm.moveUpTitle = function(key, title) {
            if (key > 0) {
                vm.profile.titles.splice(key, 1);
                vm.profile.titles.splice(key - 1, 0, title);
            }
        };

        vm.moveDownTitle = function(key, title) {
            if (key < vm.profile.titles.length) {
                vm.profile.titles.splice(key, 1);
                vm.profile.titles.splice(key + 1, 0, title);
            }
        };
    }

})();