(function () {
    'use strict';

    angular.module('errors')
        .component('errorLayout', {
            templateUrl: 'partials/error-layout.html',
            controller: errorLayout,
            controllerAs: 'vm',
            transclude: true
        });

        errorLayout.$inject = [
        '$rootScope',
        'EventsService',
        'CustomizeService'
    ];

    function errorLayout($rootScope, EventsService, CustomizeService) {
        var vm = this;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'error-layout';

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