(function () {
    'use strict';

    angular.module('accomplishments')
            .component('scientillaAccomplishmentLabel', {
                templateUrl: 'partials/scientilla-accomplishment-label.html',
                controller: scientillaAccomplishmentLabel,
                controllerAs: 'vm',
                bindings: {
                    label: "<"
                }
            });

    function scientillaAccomplishmentLabel() {
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