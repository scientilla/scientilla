(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFooter', {
            templateUrl: 'partials/scientilla-footer.html',
            controller: scientillaFooter,
            controllerAs: 'vm'
        });

    scientillaFooter.$inject = [
        'EventsService',
        'CustomizeService'
    ];

    function scientillaFooter(EventsService, CustomizeService) {
        const vm = this;

        vm.$onInit = function () {
            EventsService.subscribe(vm, EventsService.CUSTOMIZATIONS_CHANGED, function (event, customizations) {
                vm.customizations = customizations;
            });

            CustomizeService.getCustomizations().then(customizations => {
                vm.customizations = customizations;
            });
        };
    }
})();