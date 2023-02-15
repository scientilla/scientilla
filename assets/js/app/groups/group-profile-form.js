/* global angular */

(function () {
    angular
        .module('groups')
        .component('groupProfileForm', {
            templateUrl: 'partials/group-profile-form.html',
            controller: profileForm,
            controllerAs: 'vm',
            bindings: {
                onFailure: '&',
                onSubmit: '&',
                checkAndClose: '&'
            }
        });

    profileForm.$inject = [
        'ResearchEntitiesService',
        'ProfileService',
        'Notification',
        'taOptions',
        'taTools',
        'context',
        'GroupsService',
        '$scope',
        'pathProfileImages'
    ];

    function profileForm(
        ResearchEntitiesService,
        ProfileService,
        Notification,
        taOptions,
        taTools,
        context,
        GroupsService,
        $scope,
        pathProfileImages
    ) {
        const vm = this;

        vm.cancel = cancel;
        vm.profile = {
            description: {},
            collaborations: {},
            facilities: {},
            url: {},
            topics: [],
            cover: {},
        };
        vm.errors = {};
        vm.changed = {};
        vm.unsavedData = false;
        vm.profileIsLoaded = false;
        vm.coverImage = false;
        vm.areSaveButtonsEnabled = false;
        vm.pathProfileImages = false;

        let watchers = [];

        $scope.image = {};

        let originalProfileJson = '';

        /* jshint ignore:start */
        vm.$onInit = async function () {
            taOptions.toolbar = [
                ['h2', 'h3', 'h4', 'h5', 'h6', 'p', 'quote', 'bold', 'italics', 'underline', 'strikeThrough'],
                ['ul', 'ol', 'redo', 'undo', 'clear'],
                ['indent', 'outdent', 'insertLink']
            ];

            taOptions.defaultTagAttributes.a.target = '_blank';

            taTools.p.iconclass = 'fas fa-paragraph';
            taTools.p.buttontext = '';
            taTools.quote.iconclass = 'fas fa-quote-right';
            taTools.bold.iconclass = 'fas fa-bold';
            taTools.italics.iconclass = 'fas fa-italic';
            taTools.underline.iconclass = 'fas fa-underline';
            taTools.strikeThrough.iconclass = 'fas fa-strikethrough';
            taTools.ul.iconclass = 'fas fa-list-ul';
            taTools.ol.iconclass = 'fas fa-list-ol';
            taTools.redo.iconclass = 'fas fa-redo';
            taTools.undo.iconclass = 'fas fa-undo';
            taTools.clear.iconclass = 'fas fa-ban';
            taTools.indent.iconclass = 'fas fa-indent';
            taTools.outdent.iconclass = 'fas fa-outdent';
            taTools.insertLink.iconclass = 'fas fa-link';

            vm.researchEntity = await context.getResearchEntity();

            vm.pathProfileImages = pathProfileImages + '/' + vm.researchEntity.id + '/';

            getEditProfile();

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
        /* jshint ignore:end */

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

        vm.moveUpTopic = function(key, topic) {
            if (key > 0) {
                vm.profile.topics.splice(key, 1);
                vm.profile.topics.splice(key - 1, 0, topic);
            }
        };

        vm.moveDownTopic = function(key, topic) {
            if (key < vm.profile.topics.length) {
                vm.profile.topics.splice(key, 1);
                vm.profile.topics.splice(key + 1, 0, topic);
            }
        };

         /* jshint ignore:start */
        vm.save = async (close = false) => {
            const response = await GroupsService.saveProfile(vm.researchEntity.id, vm.profile, vm.coverImage);

            if (response.profile) {
                vm.profile = response.profile;
            }

            if (response.errors && !_.isEmpty(response.errors)) {
                vm.errors = response.errors;
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
            }).catch(() => {
                Notification.error('Something went wrong when receiving the group profile, please try again!');
            });
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

        function checkImage() {
            if (typeof $scope.image.maxSizeError !== "undefined") {
                if ($scope.image.maxSizeError) {
                    vm.profile.coverImage.file = null;
                    vm.profile.coverImage.errors = {};
                    vm.profile.coverImage.errors.value = [];
                    vm.profile.coverImage.errors.value.push({ message: $scope.image.maxSizeError});
                } else {
                    vm.profile.coverImage.file = $scope.image.file.name;
                    vm.coverImage = $scope.image.file;
                    vm.profile.coverImage.errors = null;
                }
            }
        }
    }
})();
