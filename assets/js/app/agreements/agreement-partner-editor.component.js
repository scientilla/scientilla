(function () {
    'use strict';

    angular.module('agreements')
        .component('agreementPartnerEditor', {
            templateUrl: 'partials/agreement-partner-editor.html',
            controller: agreementPartnerEditor,
            controllerAs: 'vm',
            bindings: {
                partners: '='
            }
        });

    agreementPartnerEditor.$inject = [];

    function agreementPartnerEditor() {
        const vm = this;

        vm.addPartner = addPartner;
        vm.removePartner = removePartner;

        vm.$onInit = function () {
            vm.newPartner = '';
            vm.isDuplicate = false;

            if (!_.isArray(vm.partners))
                vm.partners = [];
        };

        vm.$onDestroy = function () {
        };

        function addPartner($event = false) {
            if (vm.partners.includes(vm.newPartner)) {
                vm.isDuplicate = true;
            } else {
                if (vm.newPartner.length > 0) {
                    vm.partners.push(vm.newPartner);
                    vm.newPartner = '';
                    vm.isDuplicate = false;
                }
            }

            if ($event) {
                $event.preventDefault();
            }
        }

        function removePartner(partner) {
            const index = vm.partners.indexOf(partner);
            vm.partners.splice(index, 1);
        }
    }

})();