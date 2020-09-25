(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardScopusEdit', {
            templateUrl: 'partials/wizard-scopus-edit.html',
            controller: wizardScopusEdit,
            controllerAs: 'vm',
            bindings: {
                user: '=',
                originalUser: '=',
                showSaveButton: '<'
            }
        });

    wizardScopusEdit.$inject = [
        'context',
        'UsersService',
        'Notification',
        '$scope',
        '$timeout'
    ];

    function wizardScopusEdit(context, UsersService, Notification, $scope, $timeout) {
        const vm = this;

        vm.save = save;
        vm.unsavedData = false;
        vm.saveStatus = saveStatus();
        vm.cancelSave = cancelSave;

        vm.$onInit = function () {
            vm.unsavedData = false;

            $scope.$watch('idsForm.$pristine', function (formUntouched) {
                if (!formUntouched) {
                    vm.unsavedData = true;
                }
            });
        };

        vm.$onDestroy = function () {
        };

        function save(editForm) {
            vm.saveStatus.setState('saving');
            UsersService
                .doSave(vm.user)
                .then(function () {
                    vm.saveStatus.setState('saved');
                    Notification.success('Profile saved!');
                    vm.unsavedData = false;
                    vm.originalUser = angular.copy(vm.user);

                    $timeout(function() {
                        vm.saveStatus.setState('ready to save');

                        $scope.idsForm.$setPristine();
                    }, 1000);
                })
                .catch(function () {
                    Notification.warning('Failed to save user');
                    vm.saveStatus.setState('failed');

                    $timeout(function() {
                        vm.saveStatus.setState('ready to save');

                        $scope.idsForm.$setPristine();
                    }, 1000);
                });
        }

        function cancelSave() {
            vm.unsavedData = false;
            vm.user = angular.copy(vm.originalUser);
            $scope.idsForm.$setPristine();
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