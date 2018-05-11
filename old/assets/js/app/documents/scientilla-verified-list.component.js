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

    scientillaVerifiedList.$inject = [
        'documentListSections'
    ];

    function scientillaVerifiedList(documentListSections) {
        const vm = this;
        vm.documentListSections = documentListSections;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();