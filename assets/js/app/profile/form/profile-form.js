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
        vm.changed = {};
        vm.hasAboutMeErrors = false;
        vm.unsavedData = false;
        vm.profileIsLoaded = false;
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

        vm.save = (close = false) => {
            UsersService.saveProfile(AuthService.user.researchEntity, vm.profile).then(response => {

                vm.basicInformationHasErrors = false;
                vm.aboutMeHasErrors = false;

                if (response.profile) {
                    vm.profile = response.profile;
                }

                if (response.errors && !_.isEmpty(response.errors)) {
                    vm.errors = response.errors;

                    if (
                        _.has(vm.errors, 'username') ||
                        _.has(vm.errors, 'name') ||
                        _.has(vm.errors, 'surname') ||
                        _.has(vm.errors, 'jobTitle') ||
                        _.has(vm.errors, 'phone') ||
                        _.has(vm.errors, 'centers') ||
                        _.has(vm.errors, 'facilities') ||
                        _.has(vm.errors, 'researchLines') ||
                        _.has(vm.errors, 'directorate') ||
                        _.has(vm.errors, 'office')
                    ) {
                        vm.basicInformationHasErrors = true;
                    }

                    if (
                        _.has(vm.errors, 'image') ||
                        _.has(vm.errors, 'titles') ||
                        _.has(vm.errors, 'description') ||
                        _.has(vm.errors, 'role') ||
                        _.has(vm.errors, 'website') ||
                        _.has(vm.errors, 'address') ||
                        _.has(vm.errors, 'interests')
                    ) {
                        vm.aboutMeHasErrors = true;
                    }

                    $timeout(() => {
                        const errorTab = document.querySelector('.js-profile-tabs .nav-item.has-error');
                        if (errorTab) {
                            const errorTabIndex = errorTab.getAttribute('index');
                            $scope.active = parseInt(errorTabIndex);
                        }
                    });
                } else {
                    vm.errors = {};
                    vm.changed = {};
                }

                if (response.message) {
                    if (!_.isEmpty(response.count) || response.count > 0) {
                        vm.count = response.count;
                        Notification.error(response.message);
                    } else {
                        vm.count = 0;
                        Notification.success(response.message);

                        originalProfileJson = angular.toJson(vm.profile);

                        if (close) {
                            cancel();
                        }
                    }
                }
            });
        };

        function getEditProfile() {
            let profileWatcher;
            UsersService.getProfile(AuthService.user.researchEntity, true).then(response => {
                vm.profile = response.plain();
                vm.profileIsLoaded = true;
                originalProfileJson = angular.toJson(vm.profile);

                if (profileWatcher) {
                    profileWatcher();
                }

                profileWatcher = $scope.$watch('vm.profile', function(evt){
                    vm.changed['basic-info'] = isChanged('basic-info');
                    vm.changed['about-me'] = isChanged('about-me');
                    vm.changed.socials = isChanged('socials');
                    vm.changed.experiences = isChanged('experiences');
                    vm.changed.education = isChanged('education');
                    vm.changed.certificates = isChanged('certificates');
                    vm.changed.skills = isChanged('skills');
                    vm.changed['documents-accomplishments'] = isChanged('documents-accomplishments');
                    vm.changed['public-website'] = isChanged('public-website');
                }, true);

                $scope.$broadcast('setupBasicInformation', vm.profile);
            });
        }

        function isChanged(category) {
            const originalProfile = JSON.parse(originalProfileJson);

            switch (category) {
                case 'basic-info':
                    if (
                        angular.toJson(originalProfile.username) !== angular.toJson(vm.profile.username) ||
                        angular.toJson(originalProfile.name) !== angular.toJson(vm.profile.name) ||
                        angular.toJson(originalProfile.surname) !== angular.toJson(vm.profile.surname) ||
                        angular.toJson(originalProfile.jobTitle) !== angular.toJson(vm.profile.jobTitle) ||
                        angular.toJson(originalProfile.phone) !== angular.toJson(vm.profile.phone) ||
                        angular.toJson(originalProfile.directorate) !== angular.toJson(vm.profile.directorate) ||
                        angular.toJson(originalProfile.office) !== angular.toJson(vm.profile.office) ||
                        angular.toJson(originalProfile.centers) !== angular.toJson(vm.profile.centers) ||
                        angular.toJson(originalProfile.researchLines) !== angular.toJson(vm.profile.researchLines) ||
                        angular.toJson(originalProfile.facilities) !== angular.toJson(vm.profile.facilities)
                    ) {
                        return true;
                    }
                    return false;
                case 'about-me':
                    if (
                        angular.toJson(originalProfile.image) !== angular.toJson(vm.profile.image) ||
                        angular.toJson(originalProfile.titles) !== angular.toJson(vm.profile.titles) ||
                        angular.toJson(originalProfile.description) !== angular.toJson(vm.profile.description) ||
                        angular.toJson(originalProfile.role) !== angular.toJson(vm.profile.role) ||
                        angular.toJson(originalProfile.website) !== angular.toJson(vm.profile.website) ||
                        angular.toJson(originalProfile.address) !== angular.toJson(vm.profile.address) ||
                        angular.toJson(originalProfile.interests) !== angular.toJson(vm.profile.interests)
                    ) {
                        return true;
                    }
                    return false;
                case 'socials':
                    if (angular.toJson(originalProfile.socials) !== angular.toJson(vm.profile.socials)) {
                        return true;
                    }
                    return false;
                case 'experiences':
                    if (angular.toJson(originalProfile.experiences) !== angular.toJson(vm.profile.experiences)) {
                        return true;
                    }
                    return false;
                case 'education':
                    if (angular.toJson(originalProfile.education) !== angular.toJson(vm.profile.education)) {
                        return true;
                    }
                    return false;
                case 'certificates':
                    if (angular.toJson(originalProfile.certificates) !== angular.toJson(vm.profile.certificates)) {
                        return true;
                    }
                    return false;
                case 'skills':
                    if (angular.toJson(originalProfile.skillCategories) !== angular.toJson(vm.profile.skillCategories)) {
                        return true;
                    }
                    return false;
                case 'documents-accomplishments':
                    if (
                        angular.toJson(originalProfile.documents) !== angular.toJson(vm.profile.documents) ||
                        angular.toJson(originalProfile.accomplishments) !== angular.toJson(vm.profile.accomplishments)
                    ) {
                        return true;
                    }
                    return false;
                case 'public-website':
                    if (angular.toJson(originalProfile.publicWebsite) !== angular.toJson(vm.profile.publicWebsite)) {
                        return true;
                    }
                    return false;
                default:
                    return false;
            }
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
