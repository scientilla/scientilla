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
        'CustomizeService',
        'AuthService'
    ];

    function documentationLayout($rootScope, EventsService, CustomizeService, AuthService) {
        var vm = this;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'documentation';

            EventsService.subscribe(vm, EventsService.CUSTOMIZATIONS_CHANGED, function (event, customizations) {
                vm.customizations = customizations;
            });

            CustomizeService.getCustomizations().then(customizations => {
                vm.customizations = customizations;
            });

            vm.user = AuthService.user;
        };

        vm.$onDestroy = function () {
        };
    }

})();