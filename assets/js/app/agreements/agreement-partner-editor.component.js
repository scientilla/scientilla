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

    agreementPartnerEditor.$inject = [
        'Restangular'
    ];

    function agreementPartnerEditor(Restangular) {
        const vm = this;

        vm.addPartner = addPartner;
        vm.removePartner = removePartner;
        vm.getInstitutes = getInstitutes;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.institute = '';
            vm.department = '';
            vm.isDuplicate = false;

            if (!_.isArray(vm.partners)) {
                vm.partners = [];
            }

            vm.institutes = await Restangular.one('agreements', 'unique-partner-institutes').get();
        };
        /* jshint ignore:end */

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

        function getInstitutes(search) {
            return vm.institutes.filter(i => i.toLowerCase().includes(search.toLowerCase()));
        }
    }

})();
