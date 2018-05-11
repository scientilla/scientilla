(function () {
    'use strict';

    angular.module('components')
            .component('scientillaMulticheckButton', {
                templateUrl: 'partials/scientilla-multicheck-button.html',
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
                    .then(function (res) {
                        if (res === 0)
                            vm.onClick()(checkedItems);
                    })
                    .catch(function () {});

        }

    }

})();