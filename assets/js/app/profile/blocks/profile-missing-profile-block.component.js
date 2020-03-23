(function () {
    'use strict';

    angular.module('profile')
        .component('profileMissingProfileBlock', {
            templateUrl: 'partials/profile-missing-profile-block.html',
            controller: profileMissingProfileBlock,
            controllerAs: 'vm',
            bindings: {
            }
        });

    profileMissingProfileBlock.$inject = [];

    function profileMissingProfileBlock() {
        const vm = this;

        vm.$onInit = function () {

        };
    }

})();