(function () {
    'use strict';

    angular.module('profile')
        .component('profileEditBlock', {
            templateUrl: 'partials/profile-edit-block.html',
            controller: profileEditBlock,
            controllerAs: 'vm',
            bindings: {
                user: '<'
            }
        });

    profileEditBlock.$inject = ['ModalService'];

    function profileEditBlock(ModalService) {
        const vm = this;

        vm.$onInit = function () {

        };

        vm.editUserProfile = function() {
            ModalService.openProfileForm();
        };
    }

})();