(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFrontendLayout', {
            templateUrl: 'partials/scientilla-frontend-layout.html',
            controller: scientillaFrontendLayout,
            controllerAs: 'vm',
            transclude: true
        });

    scientillaFrontendLayout.$inject = [
        '$rootScope',
        'EventsService',
        'CustomizeService'
    ];

    function scientillaFrontendLayout($rootScope, EventsService, CustomizeService) {
        var vm = this;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'frontend';

            EventsService.subscribe(vm, EventsService.CUSTOMIZATIONS_CHANGED, function (event, customizations) {
                vm.customizations = customizations;
            });

            CustomizeService.getCustomizations().then(customizations => {
                vm.customizations = customizations;
            });
        };

        vm.$onDestroy = function () {
        };
    }

})();