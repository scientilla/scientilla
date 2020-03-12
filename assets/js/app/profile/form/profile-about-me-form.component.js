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
    }

})();