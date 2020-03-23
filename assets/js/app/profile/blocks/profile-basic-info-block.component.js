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

    profileBasicInfoBlock.$inject = ['AuthService', 'pathProfileImages', 'TextService'];

    function profileBasicInfoBlock(AuthService, pathProfileImages, TextService) {
        const vm = this;

        vm.pathProfileImages = pathProfileImages + '/' + AuthService.user.researchEntity + '/';

        vm.joinStrings = function (strings, seperator) {
            return TextService.joinStrings(strings, seperator);
        };

        vm.$onInit = function () {

        };
    }

})();