(function () {
    'use strict';

    angular.module('profile')
        .component('profileBasicInfoBlock', {
            templateUrl: 'partials/profile-basic-info-block.html',
            controller: profileBasicInfoBlock,
            controllerAs: 'vm',
            bindings: {
                user: '<',
                profile: '<'
            }
        });

    profileBasicInfoBlock.$inject = ['pathProfileImages', 'TextService'];

    function profileBasicInfoBlock(pathProfileImages, TextService) {
        const vm = this;

        vm.researchLines = [];
        vm.facilities = [];
        vm.directorates = [];
        vm.institutes = [];

        vm.joinStrings = function (strings, separator) {
            return TextService.joinStrings(strings, separator);
        };

        vm.$onInit = function () {
            vm.researchEntity = vm.user.researchEntity;
            vm.former = !vm.user.active;
            vm.pathProfileImages = pathProfileImages + '/' + vm.researchEntity;
            vm.researchLines = vm.profile.groups.filter(group => group.type === 'Research Line');
            vm.facilities = vm.profile.groups.filter(group => group.type === 'Facility');
            vm.directorates = vm.profile.groups.filter(group => group.type === 'Directorate');
            vm.institutes = vm.profile.groups.filter(group => group.type === 'Institute');
        };
    }

})();