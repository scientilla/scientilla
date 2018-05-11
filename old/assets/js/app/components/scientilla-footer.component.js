(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFooter', {
            templateUrl: 'partials/scientilla-footer.html',
            controller: scientillaFooter,
            controllerAs: 'vm'
        });

    scientillaFooter.$inject = [];

    function scientillaFooter() {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();