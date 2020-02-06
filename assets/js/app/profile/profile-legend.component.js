(function () {
    'use strict';

    angular.module('profile')
        .component('profileLegend', {
            templateUrl: 'partials/profile-legend.html',
            controller: profileLegend,
            controllerAs: 'vm',
            bindings: {
                public: '<?',
                locked: '<?',
                invisible: '<?'
            }
        });

    profileLegend.$inject = [];

    function profileLegend() {
        const vm = this;

        vm.showLegend = false;
        vm.showPublic = false;
        vm.showLocked = false;
        vm.showHidden = false;

        vm.$onInit = function () {
            if (!_.isNil(vm.public) && vm.public) {
                vm.showLegend = true;
                vm.showPublic = true;
            }

            if (!_.isNil(vm.locked) && vm.locked) {
                vm.showLegend = true;
                vm.showLocked = true;
            }

            if (!_.isNil(vm.invisible) && vm.invisible) {
                vm.showLegend = true;
                vm.showHidden = true;
            }
        };
    }

})();