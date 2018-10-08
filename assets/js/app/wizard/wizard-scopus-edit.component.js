(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardScopusEdit', {
            templateUrl: 'partials/wizard-scopus-edit.html',
            controller: wizardScopusEdit,
            controllerAs: 'vm',
            bindings: {
                user: '=',
                wizardCommands: '&'
            }
        });

    wizardScopusEdit.$inject = [
        'UsersService',
        'Notification',
        '$scope',
        '$rootScope'
    ];

    function wizardScopusEdit(UsersService, Notification, $scope, $rootScope) {
        const vm = this;

        vm.save = save;
        vm.unsavedData = false;
        vm.saveStatus = saveStatus();
        vm.cancelSave = cancelSave;

        vm.$onInit = function () {

            vm.unsavedData = false;
            if (!$rootScope.user) {
                $rootScope.user = angular.copy(vm.user);
            } else {
                vm.user = angular.copy($rootScope.user);
            }

            $scope.$watch('idsForm.$pristine', function (formUntouched) {
                if (!formUntouched) {
                    vm.wizardCommands()('formUnsaved');
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
                    Notification.success("Profile data saved, you can now proceed");
                    vm.wizardCommands()('formSaved');
                    vm.unsavedData = false;
                    vm.saveStatus.setState('saved');
                    $rootScope.user = angular.copy(vm.user);

                    setTimeout(function() {
                        vm.saveStatus.setState('ready to save');

                        $scope.idsForm.$setPristine();
                    }, 1000);
                })
                .catch(function () {
                    Notification.warning("Failed to save user");
                    vm.saveStatus.setState('failed');

                    setTimeout(function() {
                        vm.saveStatus.setState('ready to save');

                        $scope.idsForm.$setPristine();
                    }, 1000);
                });
        }

        function cancelSave() {
            vm.unsavedData = false;
            vm.user = angular.copy($rootScope.user);
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