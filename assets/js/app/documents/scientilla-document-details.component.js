(function () {
    'use strict';

    angular.module('references')
        .component('scientillaDocumentDetails', {
            templateUrl: 'partials/scientillaDocumentDetails.html',
            controller: scientillaDocumentsDetails,
            controllerAs: 'vm',
            bindings: {
                document: "<"
            }
        });

    scientillaDocumentsDetails.$inject = [];

    function scientillaDocumentsDetails() {
        var vm = this;


        vm.$onInit = function () {
        };
    }

})();