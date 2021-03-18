(function () {
    'use strict';

    angular.module('profile')
        .component('profileAboutMeForm', {
            templateUrl: 'partials/profile-about-me-form.html',
            controller: profileAboutMeForm,
            controllerAs: 'vm',
            bindings: {
                profile: '<',
                profileImage: '='
            }
        });

    profileAboutMeForm.$inject = ['ProfileService', 'AuthService', 'pathProfileImages', '$scope'];

    function profileAboutMeForm(ProfileService, AuthService, pathProfileImages, $scope) {
        const vm = this;

        let watchers = [];

        $scope.image = {};

        vm.pathProfileImages = pathProfileImages + '/' + AuthService.user.researchEntity + '/';

        vm.$onInit = function () {
            watchers.push(
                $scope.$watch('image.maxSizeError', () => {
                    checkImage();
                })
            );

            watchers.push(
                $scope.$watch('image.file', () => {
                    checkImage();
                })
            );
        };

        vm.$onDestroy = function () {
            _.forEach(watchers, watcher => {
                if (_.isFunction(watcher)) {
                    watcher();
                }
            });
            watchers = [];
        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.addItem = (options) => {
            ProfileService.addItem(options);
        };

        vm.moveUpTitle = function(key, title) {
            if (key > 0) {
                vm.profile.titles.splice(key, 1);
                vm.profile.titles.splice(key - 1, 0, title);
            }
        };

        vm.moveDownTitle = function(key, title) {
            if (key < vm.profile.titles.length) {
                vm.profile.titles.splice(key, 1);
                vm.profile.titles.splice(key + 1, 0, title);
            }
        };

        function checkImage() {
            if (typeof $scope.image.maxSizeError !== "undefined") {
                if ($scope.image.maxSizeError) {
                    vm.profile.image.file = null;
                    vm.profile.image.errors = {};
                    vm.profile.image.errors.value = [];
                    vm.profile.image.errors.value.push({ message: $scope.image.maxSizeError});
                } else {
                    vm.profile.image.file = $scope.image.file.name;
                    vm.profileImage = $scope.image.file;
                    vm.profile.image.errors = null;
                }
            }
        }
    }

})();