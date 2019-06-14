(function () {
    'use strict';

    angular.module('components')
            .component('scientillaMulticheckButton', {
                templateUrl: 'partials/scientilla-multicheck-button.html',
                controller: scientillaMulticheckButtonController,
                controllerAs: 'vm',
                bindings: {
                    'onClick': '&',
                    'subject': '@'
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
        const vm = this;

        vm.executeOnClick = executeOnClick;

        this.$onInit = function () {
            this.scientillaMulticheck.registerButton(vm);
        };

        function executeOnClick() {
            const checkedItems = vm.scientillaMulticheck.getCheckedItems();

            ModalService.confirm(vm.subject, "Apply this action to " + checkedItems.length + " elements?")
                    .then(function (res) {
                        if (res === 'ok')
                            vm.onClick()(checkedItems);
                    })
                    .catch(function () {});

        }

    }

})();