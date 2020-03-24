(function () {
    'use strict';

    angular.module('profile')
        .component('profileEducationForm', {
            templateUrl: 'partials/profile-education-form.html',
            controller: profileEducationForm,
            controllerAs: 'vm',
            bindings: {
                index: '<',
                profile: '<',
                education: '<',
                key: '<',
            }
        });

    profileEducationForm.$inject = ['ProfileService', '$scope'];

    function profileEducationForm(ProfileService, $scope) {
        const vm = this;

        vm.dateEducationFromPopups = [];
        vm.dateEducationToPopups = [];
        vm.datePickerOptions = [];

        let educationWatcher;

        vm.$onInit = function () {
            vm.context = 'education[' + vm.key + ']';
            vm.datePickerOptions = ProfileService.getDatepickerOptions();

            educationWatcher = $scope.$watch('vm.education', function() {
                if (typeof vm.education.from === 'string') {
                    vm.education.from = new Date(vm.education.from);
                }

                if (typeof vm.education.to === 'string') {
                    vm.education.to = new Date(vm.education.to);
                }
            });
        };

        vm.$onDestroy = function () {
            if (_.isFunction(educationWatcher)) {
                educationWatcher();
            }
        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.moveUp = function(key, education) {
            if (key > 0) {
                vm.profile.education.splice(key, 1);
                vm.profile.education.splice(key - 1, 0, education);
            }
        };

        vm.moveDown = function(key, education) {
            if (key < vm.profile.education.length) {
                vm.profile.education.splice(key, 1);
                vm.profile.education.splice(key + 1, 0, education);
            }
        };
    }

})();