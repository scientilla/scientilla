(function () {
    'use strict';

    angular.module('agreements')
        .component('agreementPartnerEditor', {
            templateUrl: 'partials/agreement-partner-editor.html',
            controller: agreementPartnerEditor,
            controllerAs: 'vm',
            bindings: {
                partners: '=',
                unsavedData: '=',
                errors: '<',
                checkValidation: '&'
            }
        });

    agreementPartnerEditor.$inject = [];

    function agreementPartnerEditor() {
        const vm = this;

        vm.addPartner = addPartner;
        vm.removePartner = removePartner;

        vm.$onInit = function () {
            vm.institute = '';
            vm.department = '';
            vm.isDuplicate = false;

            if (!_.isArray(vm.partners)) {
                vm.partners = [];
            }
        };

        vm.$onDestroy = function () {
        };

        function addPartner($event = false) {
            if (vm.partners.find(p => p.institute === vm.institute && p.department === vm.department)) {
                vm.isDuplicate = true;
            } else {
                if (vm.institute.length > 0) {
                    vm.partners.push({
                        institute: vm.institute,
                        department: vm.department
                    });
                    vm.institute = '';
                    vm.department = '';
                    vm.isDuplicate = false;
                    vm.unsavedData = true;
                }
            }

            vm.checkValidation({field: 'partners'});

            if ($event) {
                $event.preventDefault();
            }
        }

        function removePartner(partner) {
            const index = vm.partners.indexOf(partner);
            vm.partners.splice(index, 1);
            vm.unsavedData = true;
        }
    }

})();
