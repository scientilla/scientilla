(function () {
        'use strict';

        angular.module('phdTrainings')
            .component('scientillaPhdTrainingDetails', {
                templateUrl: 'partials/scientilla-phd-training-details.html',
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

            vm.$onInit = function () {

            };
        }
    }
)();
