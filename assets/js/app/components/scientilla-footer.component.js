(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFooter', {
            templateUrl: 'partials/scientilla-footer.html',
            controller: scientillaFooter,
            controllerAs: 'vm'
        });

    scientillaFooter.$inject = [
        '$rootScope'
    ];

    function scientillaFooter($rootScope) {
        const vm = this;

        vm.$onInit = function () {
            $rootScope.$emit('stickyFooter');
        };

        vm.$onDestroy = function () {
        };
    }

})();