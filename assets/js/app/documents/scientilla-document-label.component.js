(function () {
    'use strict';

    angular.module('documents')
            .component('scientillaDocumentLabel', {
                templateUrl: 'partials/scientillaDocumentLabel.html',
                controller: scientillaDocumentLabel,
                controllerAs: 'vm',
                bindings: {
                    label: "<"
                }
            });

    function scientillaDocumentLabel() {
        var vm = this;
        vm.labelNormalized = vm.label.replace(/[^\w]/gmi,'');
        
        activate();
        
        function activate() {
            
        }
        
    }

})();