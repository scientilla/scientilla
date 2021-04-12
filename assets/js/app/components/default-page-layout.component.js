(function () {
    'use strict';

    angular.module('components')
        .component('defaultPageLayout', {
            templateUrl: 'partials/default-page-layout.html',
            controller: controller,
            controllerAs: 'vm',
            transclude: true
        });

        controller.$inject = [
        '$rootScope',
        'EventsService',
        'CustomizeService',
        'AuthService'
    ];

    function controller($rootScope, EventsService, CustomizeService, AuthService) {
        var vm = this;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'page';

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