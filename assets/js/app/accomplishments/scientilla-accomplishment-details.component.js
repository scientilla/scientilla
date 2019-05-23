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
            'accomplishmentEventTypes'
        ];

        function controller(accomplishmentEventTypes) {
            const vm = this;


            vm.$onInit = function () {
                vm.accomplishment = vm.researchItem;
                const eventType = accomplishmentEventTypes.find(aet => aet.key === vm.accomplishment.eventType);
                vm.eventTypeLabel = eventType ? eventType.label : undefined;
            };

        }
    }

)();