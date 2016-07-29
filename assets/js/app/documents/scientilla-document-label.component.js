(function () {
    'use strict';

    angular.module('references')
            .component('scientillaDocumentLabel', {
                templateUrl: 'partials/scientillaDocumentLabel.html',
                controller: scientillaDocumentLabel,
                controllerAs: 'vm',
                bindings: {
                    tag: "<"
                }
            });

    function scientillaDocumentLabel() {
        var vm = this;
        
        activate();
        
        function activate() {
            
        }
        
    }

})();