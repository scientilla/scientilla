(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminCustomize', {
            templateUrl: 'partials/scientilla-admin-customize.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'Restangular',
        'CustomizeService',
        'EventsService',
        'Notification',
        '$timeout',
        '$window'
    ];

    function controller(Restangular, CustomizeService, EventsService, Notification, $timeout, $window) {
        const vm = this;

        vm.save = save;
        vm.reset = reset;

        vm.colorPickerOptions = {
            format: 'hex',
            pos: 'top left'
        };

        vm.$onInit = function () {
            CustomizeService.getCustomizations().then(customizations => {
                vm.customizations = customizations;

                console.log(vm.customizations);
            });

            EventsService.subscribe(vm, EventsService.CUSTOMIZATIONS_CHANGED, function (event, customizations) {
                vm.customizations = customizations;
            });
        };

        function save() {
            CustomizeService.setCustomizations(vm.customizations).then(result => {
                EventsService.publish(EventsService.CUSTOMIZATIONS_CHANGED, result.customizations);

                if (result.type === 'success') {
                    Notification.success(result.message);
                } else {
                    Notification.warning(result.message);
                }

                $timeout(function() {
                    $window.location.reload();
                }, 1000);
            });
        }

        function reset() {
            CustomizeService.resetCustomizations().then(result => {
                EventsService.publish(EventsService.CUSTOMIZATIONS_CHANGED, result.customizations);

                if (result.type === 'success') {
                    Notification.success(result.message);
                } else {
                    Notification.warning(result.message);
                }

                $timeout(function() {
                    $window.location.reload();
                }, 1000);
            });
        }
    }

})();