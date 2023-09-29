/* global angular */

(function () {
    angular
        .module('groups')
        .component('groupFormFields', {
            templateUrl: 'partials/group-form-fields.html',
            controller: groupFormFields,
            controllerAs: 'vm',
            bindings: {
                profile: '=',
                type: '@'
            }
        });

    groupFormFields.$inject = [
        'ProfileService',
        'pathProfileImages',
        '$scope',
        'context',
        'taOptions',
        'taTools'
    ];

    function groupFormFields(
        ProfileService,
        pathProfileImages,
        $scope,
        context,
        taOptions,
        taTools
    ) {
        const vm = this;

        vm.coverImage = false;

        vm.remaining = text => {
            if (!text) {
                return 1000;
            }
            
            return 1000 - text.length;
        };

        let watchers = [];

        $scope.image = {};

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


            watchers.push(
                $scope.$watch('vm.profile.shortDescription.value', function(newVal, oldVal) {
                    if (newVal.length > 1000) {       
                        vm.profile.shortDescription.value = oldVal;
                    }
                })
            );

            watchers.push(
                $scope.$watch('vm.profile.achievements.value', function(newVal, oldVal) {
                    if (newVal.length > 1000) {       
                        vm.profile.achievements.value = oldVal;
                    }
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
