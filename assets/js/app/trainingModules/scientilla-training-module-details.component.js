(function () {
        'use strict';

        angular.module('trainingModules')
            .component('scientillaTrainingModuleDetails', {
                templateUrl: 'partials/scientilla-training-module-details.html',
                controller,
                controllerAs: 'vm',
                bindings: {
                    researchItem: "<"
                }
            });

        controller.$inject = [
            'trainingModuleService'
        ];

        function controller(trainingModuleService) {
            const vm = this;

            vm.collapsed = true;
            vm.getNextYear = trainingModuleService.getNextYear;
            vm.researchDomains = [];

            vm.$onInit = function () {
                vm.researchDomains = JSON.parse(vm.researchItem.researchDomains);
            };
        }
    }
)();
