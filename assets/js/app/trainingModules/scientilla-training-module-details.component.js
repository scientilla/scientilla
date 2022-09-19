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
        ];

        function controller() {
            const vm = this;

            vm.collapsed = true;

            vm.$onInit = function () {};
        }
    }
)();
