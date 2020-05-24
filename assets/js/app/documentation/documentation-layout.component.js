(function () {
    'use strict';

    angular.module('documentation')
        .component('documentationLayout', {
            templateUrl: 'partials/documentation-layout.html',
            controller: documentationLayout,
            controllerAs: 'vm',
            transclude: true
        });

    documentationLayout.$inject = [
        '$rootScope',
        'EventsService',
        'CustomizeService'
    ];

    function documentationLayout($rootScope, EventsService, CustomizeService) {
        var vm = this;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'documentation';

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