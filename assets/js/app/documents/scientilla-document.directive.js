(function () {
    'use strict';

    angular.module('documents')
            .directive('scientillaDocument', scientillaDocument);

    function scientillaDocument() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDocument.html',
            controller: scientillaDocumentController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                document: "="
            }
        };
    }

    function scientillaDocumentController(ModalService) {
        var vm = this;
        vm.openDetails = openDetails;
        
        activate();
        
        function activate() {
            
        }

        function openDetails() {
            ModalService
                .openScientillaDocumentDetails(vm.document);
        }
        
    }

})();