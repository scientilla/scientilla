(function () {
    'use strict';

    angular.module('components')
            .component('scientillaButton', {
                templateUrl: 'partials/scientillaButton.html',
                controller: scientillaButtonController,
                controllerAs: 'vm',
                bindings: {
                    type: '@?',
                    size: '@?',
                    ngDisabled: '<',
                    click: '&'
                },
                transclude: true
            });

    function scientillaButtonController() {
        const vm = this;
        vm.getClasses = getClasses;
        
        activate();
        
        function activate() {
            vm.type = vm.type || 'button';
            vm.size = vm.size || 'medium';
        }
        
        function getClasses() {
            const typeClassesTable = {
                submit: 'btn-primary',
                button: 'btn-primary',
                secondary: 'btn btn-default',
                cancel: 'btn-default btn-cancel',
                link: 'btn-link'
            };
            const sizeClassesTable = {
                small: 'btn-sm',
                medium: ''
            };
            return typeClassesTable[vm.type] + ' ' + sizeClassesTable[vm.size];
        }
    }

})();