(function () {
    'use strict';

    angular.module('profile')
        .component('profileBasicInfoBlock', {
            templateUrl: 'partials/profile-basic-info-block.html',
            controller: profileBasicInfoBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileBasicInfoBlock.$inject = ['AuthService', 'pathProfileImages'];

    function profileBasicInfoBlock(AuthService, pathProfileImages) {
        const vm = this;

        vm.pathProfileImages = pathProfileImages + '/' + AuthService.user.researchEntity + '/';

        vm.$onInit = function () {

        };
    }

})();