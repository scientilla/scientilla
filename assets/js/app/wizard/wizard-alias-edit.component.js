(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardAliasEdit', {
            templateUrl: 'partials/wizard-alias-edit.html',
            controller: wizardAliasEdit,
            controllerAs: 'vm',
            bindings: {
                user: '<',
                wizardCommands: '&'
            }
        });

    wizardAliasEdit.$inject = [
        'Notification'
    ];

    function wizardAliasEdit(Notification) {
        const vm = this;

        vm.save = save;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };

        function save() {
            vm.user.save()
                .then(() => Notification.success("Profile data saved, you can now proceed"))
                .catch(() => Notification.warning("Failed to save aliases"));
        }
    }

})();