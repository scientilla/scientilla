(function () {
    'use strict';

    angular.module('components')
            .component('badge', {
                templateUrl: 'partials/badge.html',
                controller: controller,
                controllerAs: 'vm',
                bindings: {
                    label: "<"
                }
            });

    function controller() {
        var vm = this;

        vm.badges = [];
        vm.badges.external = 'success';
        vm.badges.new = 'success';
        vm.badges.discarded = 'danger';
        vm.badges.duplicate = 'warning';
        vm.badges['already verified'] = 'warning';
        vm.badges['already in drafts'] = 'warning';
        vm.badges.unverifying = 'secondary';
    }

})();
