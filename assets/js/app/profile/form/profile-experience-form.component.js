(function () {
    'use strict';

    angular.module('profile')
        .component('profileExperienceForm', {
            templateUrl: 'partials/profile-experience-form.html',
            controller: profileExperienceForm,
            controllerAs: 'vm',
            bindings: {
                index: '<',
                profile: '<',
                experience: '<',
                key: '<',
            }
        });

    profileExperienceForm.$inject = ['ProfileService', '$scope', 'DateService'];

    function profileExperienceForm(ProfileService, $scope, DateService) {
        const vm = this;

        vm.openFrom = false;
        vm.openTo = false;
        vm.datePickerOptions = [];
        vm.currentExperience = vm.experience.to ? false : true;

        let experienceWatcher;

        vm.dateFrom = null;
        vm.dateTo = null;

        vm.$onInit = function () {
            vm.context = 'experiencesExternal[' + vm.key + ']';
            vm.datePickerOptions = ProfileService.getDatepickerOptions();
            vm.datePickerOptions.minMode = 'month';
            vm.datePickerOptions.datepickerMode = 'month';

            experienceWatcher = $scope.$watch('vm.experience', function() {
                if (typeof vm.experience.from === 'string' && !_.isEmpty(vm.experience.from)) {
                    vm.dateFrom = DateService.toDate(vm.experience.from);
                }

                if (typeof vm.experience.to === 'string' && !_.isEmpty(vm.experience.to)) {
                    vm.dateTo = DateService.toDate(vm.experience.to);
                }

                vm.currentExperience = vm.experience.to ? false : true;
            });
        };

        vm.$onDestroy = function () {
            if (_.isFunction(experienceWatcher)) {
                experienceWatcher();
            }
        };

        vm.removeItem = (options) => {
            ProfileService.removeItem(options);
        };

        vm.moveUp = function(key, experience) {
            if (key > 0) {
                vm.profile.experiencesExternal.splice(key, 1);
                vm.profile.experiencesExternal.splice(key - 1, 0, experience);
            }
        };

        vm.moveDown = function(key, experience) {
            if (key < vm.profile.experiencesExternal.length) {
                vm.profile.experiencesExternal.splice(key, 1);
                vm.profile.experiencesExternal.splice(key + 1, 0, experience);
            }
        };

        vm.checkboxClick = function() {
            if (vm.currentExperience) {
                vm.experience.to = '';
            } else {
                vm.experience.to = new Date();
            }
        };

        vm.changeDateFrom = () => {
            if (!vm.dateFrom) {
                return;
            }

            vm.experience.from = DateService.toOurTimezone(vm.dateFrom);
        };

        vm.changeDateTo = () => {
            if (!vm.dateTo) {
                return;
            }

            vm.experience.to = DateService.toOurTimezone(vm.dateTo);
        };
    }

})();