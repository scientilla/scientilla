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
        vm.unsavedData = false;
        vm.saveStatus = saveStatus();

        vm.$onInit = function () {
            $scope.$watch('idsForm.$pristine', function (formUntouched) {
                if (!formUntouched) {
                    vm.wizardCommands()('formUnsaved');
                    vm.unsavedData = true;
                }
            });
        };

        vm.$onDestroy = function () {
        };

        function save() {
            vm.saveStatus.setState('saving');
            UsersService
                .doSave(vm.user)
                .then(function () {
                    Notification.success("Profile data saved, you can now proceed");
                    vm.wizardCommands()('formSaved');
                    vm.unsavedData = false;
                    vm.saveStatus.setState('saved');

                    setTimeout(function() {
                        vm.saveStatus.setState('ready to save');
                    }, 1000);
                })
                .catch(function () {
                    Notification.warning("Failed to save user");
                    vm.saveStatus.setState('failed');

                    setTimeout(function() {
                        vm.saveStatus.setState('ready to save');
                    }, 1000);
                });
        }

        function saveStatus() {
            return {
                setState: function (state) {
                    this.state = state;

                    switch(true) {
                        case state === 'ready to save':
                            this.message = 'Save profile';
                            break;
                        case state === 'saving':
                            this.message = 'Saving profile';
                            break;
                        case state === 'saved':
                            this.message = 'Profile is saved!';
                            break;
                        case state === 'failed':
                            this.message = 'Failed to save profile!';
                            break;
                    }
                },
                state: 'ready to save',
                message: 'Save profile'
            };
        }
    }

})();