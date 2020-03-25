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

    profileExperienceForm.$inject = ['ProfileService', '$scope'];

    function profileExperienceForm(ProfileService, $scope) {
        const vm = this;

        vm.openFrom = false;
        vm.openTo = false;
        vm.datePickerOptions = [];

        let experienceWatcher;

        vm.$onInit = function () {
            vm.context = 'experiences[' + vm.key + ']';
            vm.datePickerOptions = ProfileService.getDatepickerOptions();

            experienceWatcher = $scope.$watch('vm.experience', function() {
                if (typeof vm.experience.from === 'string') {
                    vm.experience.from = new Date(vm.experience.from);
                }

                if (typeof vm.experience.to === 'string') {
                    vm.experience.to = new Date(vm.experience.to);
                }
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
                vm.profile.experiences.splice(key, 1);
                vm.profile.experiences.splice(key - 1, 0, experience);
            }
        };

        vm.moveDown = function(key, experience) {
            if (key < vm.profile.experiences.length) {
                vm.profile.experiences.splice(key, 1);
                vm.profile.experiences.splice(key + 1, 0, experience);
            }
        };
    }

})();