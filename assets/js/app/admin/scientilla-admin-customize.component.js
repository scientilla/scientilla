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
        'Notification'
    ];

    function controller(Restangular, CustomizeService, EventsService, Notification) {
        const vm = this;

        vm.save = save;

        vm.$onInit = function () {
            CustomizeService.getCustomizations().then(customizations => {
                vm.customizations = customizations;
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
            });
        }
    }

})();