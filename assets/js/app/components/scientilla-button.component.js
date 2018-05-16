(function () {
    'use strict';

    angular.module('components')
        .component('scientillaButton', {
            templateUrl: 'partials/scientilla-button.html',
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

        const typeTable = {
            submit: 'submit',
            button: 'button',
            secondary: 'button',
            cancel: 'button',
            link: 'button',
        };

        vm.$onInit = function () {
            vm.type = vm.type || 'button';
            vm.buttonType = typeTable[vm.type];
            vm.size = vm.size || 'medium';
        };

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