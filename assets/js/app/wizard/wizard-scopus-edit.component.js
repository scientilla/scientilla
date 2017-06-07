(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardScopusEdit', {
            templateUrl: 'partials/wizard-scopus-edit.html',
            controller: wizardScopusEdit,
            controllerAs: 'vm',
            bindings: {
                user: '<',
                wizardCommands: '&'
            }
        });

    wizardScopusEdit.$inject = [
        'UsersService',
        'Notification',
        '$scope'
    ];

    function wizardScopusEdit(UsersService, Notification, $scope) {
        const vm = this;

        vm.save = save;

        vm.$onInit = function () {
            $scope.$watch('idsForm.$pristine', function (formUntouched) {
                if (!formUntouched)
                    vm.wizardCommands()('stop');
            });
        };

        vm.$onDestroy = function () {
        };

        function save() {
            UsersService
                .doSave(vm.user)
                .then(function () {
                    Notification.success("Profile data saved, you can now proceed");
                    vm.wizardCommands()('continue');
                })
                .catch(function () {
                    Notification.warning("Failed to save user");
                    vm.wizardCommands()('continue');
                });
        }
    }

})();