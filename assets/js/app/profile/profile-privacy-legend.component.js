(function () {
    'use strict';

    angular.module('profile')
        .component('profilePrivacyLegend', {
            templateUrl: 'partials/profile-privacy-legend.html',
            controller: profilePrivacyLegend,
            controllerAs: 'vm',
            bindings: {
                show: '<?'
            }
        });

    profilePrivacyLegend.$inject = [];

    function profilePrivacyLegend() {
        const vm = this;

        vm.$onInit = function () {
            if (typeof vm.show === 'undefined') {
                vm.show = true;
            }
        };
    }

})();