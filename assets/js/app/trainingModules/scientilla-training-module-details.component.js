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
            'trainingModuleService',
            'trainingModuleTypes'
        ];

        function controller(trainingModuleService, trainingModuleTypes) {
            const vm = this;

            vm.collapsed = true;
            vm.getNextYear = trainingModuleService.getNextYear;
            vm.researchDomains = [];
            vm.moduleTypes = trainingModuleTypes;

            vm.$onInit = function () {
                vm.researchDomains = JSON.parse(vm.researchItem.researchDomains);
            };
        }
    }
)();
