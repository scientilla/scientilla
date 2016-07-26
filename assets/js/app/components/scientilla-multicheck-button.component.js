(function () {
    'use strict';

    angular.module('components')
            .component('scientillaMulticheckButton', {
                templateUrl: 'partials/scientillaMulticheckButton.html',
                controller: scientillaMulticheckButtonController,
                controllerAs: 'vm',
                bindings: {
                    'onClick': '&'
                },
                transclude: true,
                require: {
                    scientillaMulticheck: '^scientillaMulticheck'
                }
            });



    scientillaMulticheckButtonController.$inject = [
    ];

    function scientillaMulticheckButtonController() {
        var vm = this;

        vm.executeOnClick = executeOnClick;

        this.$onInit = function() {
            this.scientillaMulticheck.registerButton(vm);
        };

        function executeOnClick() {
            var checkedItems = vm.scientillaMulticheck.getCheckedItems();
            vm.onClick()(checkedItems);
        }

    }

})();