(function () {
        'use strict';

        angular.module('documents')
            .component('scientillaAccomplishmentDetails', {
                templateUrl: 'partials/scientilla-accomplishment-details.html',
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
                vm.accomplishment = vm.researchItem;
            };

        }
    }

)();