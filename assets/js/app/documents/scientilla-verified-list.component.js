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
        'documentListSections',
        'documentCategories'
    ];

    function scientillaVerifiedList(documentListSections, documentCategories) {
        const vm = this;
        vm.documentListSections = documentListSections;
        vm.documentCategories = documentCategories;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();