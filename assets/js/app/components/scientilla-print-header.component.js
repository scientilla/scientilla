(function () {
    'use strict';

    angular.module('components')
        .component('scientillaPrintHeader', {
            templateUrl: 'partials/scientilla-print-header.html',
            controller: scientillaPrintHeader,
            controllerAs: 'vm'
        });

    scientillaPrintHeader.$inject = [];

    function scientillaPrintHeader() {

    }
})();