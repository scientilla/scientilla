(function () {
    'use strict';

    angular.module('projects')
        .component('scientillaProjectTypeBadge', {
            templateUrl: 'partials/scientilla-project-type-badge.html',
            controller: scientillaProjectTypeBadge,
            controllerAs: 'vm',
            bindings: {
                type: "<"
            }
        });

    scientillaProjectTypeBadge.$inject = [];

    function scientillaProjectTypeBadge() {
        const vm = this;

        vm.$onInit = function () {
        };
    }

})();