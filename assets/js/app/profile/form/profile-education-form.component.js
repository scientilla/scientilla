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

    profileEducationForm.$inject = ['ProfileService', '$scope', 'DateService'];

    function profileEducationForm(ProfileService, $scope, DateService) {
        const vm = this;

        vm.openFrom = false;
        vm.openTo = false;
        vm.datePickerOptions = [];
        vm.currentEducation = vm.education.to ? false : true;

        let educationWatcher;

        vm.dateFrom = null;
        vm.dateTo = null;

        vm.$onInit = function () {
            vm.context = 'education[' + vm.key + ']';
            vm.datePickerOptions = ProfileService.getDatepickerOptions();
            vm.datePickerOptions.minMode = 'year';
            vm.datePickerOptions.datepickerMode = 'year';

            educationWatcher = $scope.$watch('vm.education', function() {
                if (typeof vm.education.from === 'string' && !_.isEmpty(vm.education.from)) {
                    vm.dateFrom = DateService.toDate(vm.education.from);
                }

                if (typeof vm.education.to === 'string' && !_.isEmpty(vm.education.to)) {
                    vm.dateTo = DateService.toDate(vm.education.to);
                }

                vm.currentEducation = vm.education.to ? false : true;
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

        vm.checkboxClick = function() {
            if (vm.currentEducation) {
                vm.education.to = '';
            } else {
                vm.education.to = new Date();
            }
        };

        vm.changeDateFrom = () => {
            if (!vm.dateFrom) {
                return;
            }

            vm.education.from = DateService.toOurTimezone(vm.dateFrom);
        };

        vm.changeDateTo = () => {
            if (!vm.dateTo) {
                return;
            }

            vm.education.to = DateService.toOurTimezone(vm.dateTo);
        };
    }

})();