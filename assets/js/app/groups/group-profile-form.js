/* global angular */

(function () {
    angular
        .module('groups')
        .component('groupProfileForm', {
            templateUrl: 'partials/group-profile-form.html',
            controller: profileForm,
            controllerAs: 'vm',
            bindings: {
                group: '<',
                onFailure: '&',
                onSubmit: '&',
                checkAndClose: '&'
            }
        });

    profileForm.$inject = [
        'ResearchEntitiesService',
        'ProfileService',
        'Notification',
        'context',
        'GroupsService',
        '$scope',
        'researchEntityService',
        'groupTypes',
        'AuthService'
    ];

    function profileForm(
        ResearchEntitiesService,
        ProfileService,
        Notification,
        context,
        GroupsService,
        $scope,
        researchEntityService,
        groupTypes,
        AuthService
    ) {
        const vm = this;

        vm.cancel = cancel;
        vm.profile = {
            description: {},
            shortDescription: {
                value: ''
            },
            achievements: {
                value: ''
            },
            collaborations: {},
            facilities: {},
            url: {},
            topics: [],
            coverImage: {},
        };
        vm.errors = {};
        vm.changed = {};
        vm.unsavedData = false;
        vm.profileIsLoaded = false;
        vm.areSaveButtonsEnabled = false;
        vm.pathProfileImages = false;
        vm.groupTypes = groupTypes;

        vm.urlAllDocuments = '';
        vm.urlFavoriteDocuments = '';
        vm.favoriteDocuments = [];

        vm.selectedItem = '0';
        vm.selectChanged = () => {
            vm.active = parseInt(vm.selectedItem);
        };

        vm.coverImage = false;

        let originalProfileJson = '';
        let profileWatcher;

        vm.loggedUser = AuthService.user;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            vm.urlAllDocuments = `/#/${vm.group.slug}/documents/verified`;
            vm.urlFavoriteDocuments = `/#/${vm.group.slug}/documents/verified?favorites`;

            getEditProfile();

            vm.favoriteDocuments = await researchEntityService.getDocuments(vm.group, {}, true, []);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            if (profileWatcher) {
                profileWatcher();
            }
        };

         /* jshint ignore:start */
        vm.save = async (close = false) => {
            const response = await GroupsService.saveProfile(vm.researchEntity.id, vm.profile, vm.coverImage);

            vm.basicInformationHasErrors = false;
            vm.completeProfileHasErrors = false;

            if (response.profile) {
                vm.profile = response.profile;
            }

            if (response.errors && !_.isEmpty(response.errors)) {
                vm.errors = response.errors;

                if (
                    _.has(vm.errors, 'shortDescription') ||
                    _.has(vm.errors, 'achievements')
                ) {
                    vm.basicInformationHasErrors = true;
                    vm.completeProfileHasErrors = true;
                }

                if (
                    _.has(vm.errors, 'description') ||
                    _.has(vm.errors, 'collaborations') ||
                    _.has(vm.errors, 'laboratories') ||
                    _.has(vm.errors, 'url') ||
                    _.has(vm.errors, 'topics') ||
                    _.has(vm.errors, 'coverImage')
                ) {
                    vm.completeProfileHasErrors = true;
                }
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
        };
         /* jshint ignore:end */

        vm.selectChanged = () => {
            vm.active = parseInt(vm.selectedItem);
        };

        function getEditProfile() {
            ResearchEntitiesService.getProfile(vm.researchEntity.id, true).then(response => {
                vm.profile = response.plain();
                vm.profileIsLoaded = true;
                originalProfileJson = angular.toJson(vm.profile);

                if (!_.isEmpty(vm.profile)) {
                    vm.areSaveButtonsEnabled = true;
                }

                profileWatcher = $scope.$watch('vm.profile', function(evt){
                    vm.changed['basic-info'] = isChanged('basic-info');
                    vm.changed['complete-profile'] = isChanged('complete-profile');
                }, true);
            }).catch(() => {
                Notification.error('Something went wrong when receiving the group profile, please try again!');
            });
        }

        function isChanged(category) {
            const originalProfile = JSON.parse(originalProfileJson);

            switch (category) {
                case 'basic-info':
                    if (
                        angular.toJson(originalProfile.shortDescription) !== angular.toJson(vm.profile.shortDescription) ||
                        angular.toJson(originalProfile.achievements) !== angular.toJson(vm.profile.achievements) 
                    ) {
                        return true;
                    }
                    return false;
                case 'complete-profile':
                    if (
                        angular.toJson(originalProfile.shortDescription) !== angular.toJson(vm.profile.shortDescription) ||
                        angular.toJson(originalProfile.achievements) !== angular.toJson(vm.profile.achievements) ||
                        angular.toJson(originalProfile.description) !== angular.toJson(vm.profile.description) ||
                        angular.toJson(originalProfile.collaborations) !== angular.toJson(vm.profile.collaborations) ||
                        angular.toJson(originalProfile.laboratories) !== angular.toJson(vm.profile.laboratories) ||
                        angular.toJson(originalProfile.url) !== angular.toJson(vm.profile.url) ||
                        angular.toJson(originalProfile.topics) !== angular.toJson(vm.profile.topics) ||
                        vm.profile.coverImage.file
                    ) {
                        return true;
                    }
                    return false;
                default:
                    return false;
            }
        }

        function cancel() {
            if (_.isFunction(vm.checkAndClose())) {
                if (vm.areSaveButtonsEnabled) {
                    vm.checkAndClose()(() => angular.toJson(vm.profile) === originalProfileJson);
                } else {
                    vm.checkAndClose()(() => true);
                }
            }
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure())) {
                vm.onFailure()();
            }
        }
    }
})();
