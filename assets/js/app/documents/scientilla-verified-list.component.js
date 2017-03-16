(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaVerifiedList', {
            templateUrl: 'partials/scientilla-verified-list.html',
            controller: scientillaVerifiedList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    scientillaVerifiedList.$inject = [];

    function scientillaVerifiedList() {
        var vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();