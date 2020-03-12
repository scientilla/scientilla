(function () {
    'use strict';

    angular.module('profile')
        .component('profileAboutBlock', {
            templateUrl: 'partials/profile-about-block.html',
            controller: profileAboutBlock,
            controllerAs: 'vm',
            bindings: {
                profile: '<'
            }
        });

    profileAboutBlock.$inject = [];

    function profileAboutBlock() {
        const vm = this;

        vm.$onInit = function () {

        };
    }

})();