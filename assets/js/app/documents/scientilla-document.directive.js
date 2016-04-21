(function () {
    'use strict';

    angular.module('references')
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

    function scientillaDocumentController() {
        var vm = this;
        
        vm.isDiscarded = isDiscarded;
        
        activate();
        
        function isDiscarded(){
            return !!vm.document.discarded;
        }
        
        

        function activate() {
            
        }
        
    }

})();