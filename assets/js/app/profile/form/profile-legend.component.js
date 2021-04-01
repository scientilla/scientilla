(function () {
    'use strict';

    angular.module('profile')
        .component('profileLegend', {
            templateUrl: 'partials/profile-legend.html',
            controller: profileLegend,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                type: '@'
            }
        });

    profileLegend.$inject = [];

    function profileLegend() {
        const vm = this;

        vm.showLegend = false;
        vm.showPublic = false;
        vm.showhidden = false;
        vm.showInvisible = false;

        vm.$onInit = function () {

            switch (true) {
                case vm.type === 'basic-information' :
                    if (!vm.profile.hidden) {
                        vm.showPublic = true;
                    }
                    vm.showHidden = true;
                    vm.showLegend = true;
                    break;
                case
                    vm.type === 'about-me' ||
                    vm.type === 'socials' ||
                    vm.type === 'experiences' ||
                    vm.type === 'education' ||
                    vm.type === 'certificates' ||
                    vm.type === 'skills'
                :
                    if (vm.profile.hidden) {
                        vm.showHidden = true;
                    } else {
                        vm.showPublic = true;
                        vm.showHidden = true;
                        vm.showInvisible = true;
                    }
                    vm.showLegend = true;
                    break;
                case vm.type === 'profile-only' :
                    vm.showHidden = true;
                    vm.showInvisible = true;
                    vm.showLegend = true;
                    break;
                default:
                    break;
            }
        };
    }

})();