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
        'ModalService'
    ];

    function scientillaMulticheckButtonController(ModalService) {
        var vm = this;

        vm.executeOnClick = executeOnClick;

        this.$onInit = function () {
            this.scientillaMulticheck.registerButton(vm);
        };

        function executeOnClick() {
            var checkedItems = vm.scientillaMulticheck.getCheckedItems();

            ModalService
                    .confirm("", "Apply this action to " + checkedItems.length + " elements?")
                    .then(function () {
                        vm.onClick()(checkedItems);
                    })
                    .catch(function () {});

        }

    }

})();