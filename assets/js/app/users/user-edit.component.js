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

        vm.count = 0;
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

                if (response.profile) {
                    vm.profile = response.profile;
                }

                if (response.message) {
                    if (!_.isEmpty(response.count) || response.count > 0) {
                        vm.count = response.count;
                        Notification.error(response.message);
                    } else {
                        vm.count = 0;
                        Notification.success(response.message);
                    }

                    angular.element('html, body').animate({scrollTop: 0});
                }
            });
        };
    }

})();