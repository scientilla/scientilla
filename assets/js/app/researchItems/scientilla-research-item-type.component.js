(function () {
    'use strict';

    angular.module('app')
        .component('scientillaResearchItemType', {
            templateUrl: 'partials/scientilla-research-item-type.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                researchItemType: "<"
            }
        });

    controller.$inject = [];

    function controller() {
        const vm = this;

    }

})();