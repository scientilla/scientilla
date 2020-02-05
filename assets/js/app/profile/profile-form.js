/* global angular */

(function () {
    angular
        .module('profile')
        .component('profileForm', {
            templateUrl: 'partials/profile-form.html',
            controller: profileForm,
            controllerAs: 'vm',
            bindings: {
                onFailure: '&',
                onSubmit: '&',
                checkAndClose: '&'
            }
        });


    profileForm.$inject = [
        'UsersService',
        'AuthService',
        'ProfileService',
        'Notification',
        '$timeout',
        '$scope',
    ];

    function profileForm(UsersService, AuthService, ProfileService, Notification, $timeout, $scope) {
        const vm = this;

        vm.index = 0;
        vm.cancel = cancel;
        vm.count = 0;
        vm.profile = {};
        vm.errors = {};
        vm.hasAboutMeErrors = false;
        vm.unsavedData = false;
        let originalProfileJson = '';

        vm.$onInit = function () {
            getEditProfile();
        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.addItem = (options) => {
            ProfileService.addItem(options);
        };

        vm.save = () => {
            UsersService.saveProfile(AuthService.user.researchEntity, vm.profile).then(response => {

                if (response.profile) {
                    vm.profile = response.profile;
                }

                if (response.errors && !_.isEmpty(response.errors)) {
                    vm.errors = response.errors;

                    vm.hasAboutMeErrors = false;
                    if (
                        _.has(vm.errors, 'image') ||
                        _.has(vm.errors, 'displayNames') ||
                        _.has(vm.errors, 'titles') ||
                        _.has(vm.errors, 'description') ||
                        _.has(vm.errors, 'role') ||
                        _.has(vm.errors, 'website') ||
                        _.has(vm.errors, 'address') ||
                        _.has(vm.errors, 'interests')
                    ) {
                        vm.hasAboutMeErrors = true;
                    }

                    $timeout(() => {
                        const errorTab = document.querySelector('.js-profile-tabs .nav-item.has-error');
                        if (errorTab) {
                            const errorTabIndex = errorTab.getAttribute('index');
                            $scope.active = parseInt(errorTabIndex);
                        }
                    });
                }

                if (response.message) {
                    if (!_.isEmpty(response.count) || response.count > 0) {
                        vm.count = response.count;
                        Notification.error(response.message);
                    } else {
                        vm.count = 0;
                        Notification.success(response.message);

                        originalProfileJson = angular.toJson(vm.profile);
                    }
                }
            });
        };

        function getEditProfile() {
            UsersService.getProfile(AuthService.user.researchEntity, true).then(response => {
                vm.profile = response.plain();
                originalProfileJson = angular.toJson(vm.profile);

                $scope.$broadcast('setupBasicInformation', vm.profile);
            });
        }

        function cancel() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => angular.toJson(vm.profile) === originalProfileJson);
            }
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure())) {
                vm.onFailure()();
            }
        }
    }
})();
