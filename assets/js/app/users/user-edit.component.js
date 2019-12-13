(function () {
    'use strict';

    angular.module('users')
        .component('userEdit', {
            templateUrl: 'partials/user-edit.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'UsersService',
        'AuthService',
        'Notification',
        'ProfileService',
        '$scope'
    ];

    function controller(UsersService, AuthService, Notification, ProfileService, $scope) {
        const vm = this;

        vm.errors = [];
        vm.profile = {};

        function getEditProfile() {
            UsersService.getProfile(AuthService.user.researchEntity, true).then(response => {
                vm.profile = response.plain();

                $scope.$broadcast('setupBasicInformation', vm.profile);
            });
        }

        /* jshint ignore:start */
        vm.$onInit = async function () {
            getEditProfile();
        };
        /* jshint ignore:end */

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.addItem = (options) => {
            ProfileService.addItem(options);
        };

        vm.save = () => {
            const profile = JSON.stringify(vm.profile);
            UsersService.saveProfile(AuthService.user.researchEntity, profile).then(response => {
                response = response.plain();
                vm.errors = response.errors;

                if (response.message) {
                    if (!_.isEmpty(response.errors)) {
                        Notification.error(response.message);
                    } else {
                        Notification.success(response.message);
                    }
                }
            });
        };
    }

})();