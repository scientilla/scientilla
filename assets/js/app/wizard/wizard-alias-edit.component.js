(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardAliasEdit', {
            templateUrl: 'partials/wizard-alias-edit.html',
            controller: wizardAliasEdit,
            controllerAs: 'vm',
            bindings: {
                user: '='
            }
        });

    wizardAliasEdit.$inject = [
        'Notification',
        '$scope',
        'ModalService',
        'FormService',
        '$timeout'
    ];

    function wizardAliasEdit(Notification, $scope, ModalService, FormService, $timeout) {
        const vm = this;

        vm.save = save;
        vm.saveStatus = saveStatus();
        vm.unsavedData = false;

        vm.$onInit = function () {
            vm.unsavedData = FormService.getUnsavedData('alias-edit');

            $scope.$watch(function() {
                return vm.unsavedData;
            }, function() {
                FormService.setUnsavedData('alias-edit', vm.unsavedData);
            }, true);
        };

        vm.$onDestroy = function () {
        };

        function save() {
            vm.saveStatus.setState('saving');
            vm.user.save()
                .then(() => {
                    vm.saveStatus.setState('saved');
                    Notification.success(vm.saveStatus.message);
                    vm.unsavedData = false;

                    $timeout(function() {
                        vm.saveStatus.setState('ready to save');
                    }, 1000);
                })
                .catch(() => {
                    vm.saveStatus.setState('failed');
                    Notification.warning(vm.saveStatus.message);

                    $timeout(function() {
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
                            this.message = 'Save aliases';
                            break;
                        case state === 'saving':
                            this.message = 'Saving aliases';
                            break;
                        case state === 'saved':
                            this.message = 'Aliases are saved!';
                            break;
                        case state === 'failed':
                            this.message = 'Failed to save aliases!';
                            break;
                    }
                },
                state: 'ready to save',
                message: 'Save aliases'
            };
        }
    }

})();