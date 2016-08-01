(function () {
    'use strict';

    angular.module('components')
            .component('scientillaButton', {
                templateUrl: 'partials/scientillaButton.html',
                controller: scientillaButtonController,
                controllerAs: 'vm',
                bindings: {
                    'type': '@?',
                    'size': '@?',
                    'ng-click': '&'
                },
                transclude: true
            });

    function scientillaButtonController() {
        var vm = this;
        vm.getClasses = getClasses;
        
        activate();
        
        function activate() {
            vm.type = vm.type || 'submit';
            vm.size = vm.size || 'medium';
        }
        
        function getClasses() {
            var typeClassesTable = {
                submit: 'btn-primary',
                cancel: 'btn-default btn-cancel'
            };
            var sizeClassesTable = {
                small: 'btn-sm',
                medium: ''
            };
            return typeClassesTable[vm.type] + ' ' + sizeClassesTable[vm.size];
        }
    }

})();