(function () {
    'use strict';

    angular.module('profile')
        .component('profileBasicInfoBlock', {
            templateUrl: 'partials/profile-basic-info-block.html',
            controller: profileBasicInfoBlock,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                profile: '<',
                former: '<?'
            }
        });

    profileBasicInfoBlock.$inject = ['AuthService', 'pathProfileImages', 'TextService'];

    function profileBasicInfoBlock(AuthService, pathProfileImages, TextService) {
        const vm = this;

        vm.pathProfileImages = pathProfileImages + '/' + vm.researchEntity;

        vm.researchLines = [];
        vm.facilities = [];
        vm.directorates = [];
        vm.institutes = [];

        vm.joinStrings = function (strings, seperator) {
            return TextService.joinStrings(strings, seperator);
        };

        vm.$onInit = function () {
            vm.researchLines = vm.profile.groups.filter(group => group.type === 'Research Line');
            vm.facilities = vm.profile.groups.filter(group => group.type === 'Facility');
            vm.directorates = vm.profile.groups.filter(group => group.type === 'Directorate');
            vm.institutes = vm.profile.groups.filter(group => group.type === 'Institute');
        };
    }

})();