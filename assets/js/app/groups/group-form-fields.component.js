/* global angular */

(function () {
    angular
        .module('groups')
        .component('groupFormFields', {
            templateUrl: 'partials/group-form-fields.html',
            controller: groupFormFields,
            controllerAs: 'vm',
            bindings: {
                group: '<',
                profile: '=',
                coverImage: '=',
                type: '@',
                disabled: '<?'
            }
        });

    groupFormFields.$inject = [
        'ProfileService',
        'pathProfileImages',
        '$scope',
        'context',
        'taOptions',
        'taTools',
        'groupTypes'
    ];

    function groupFormFields(
        ProfileService,
        pathProfileImages,
        $scope,
        context,
        taOptions,
        taTools,
        groupTypes
    ) {
        const vm = this;

        vm.remaining = (text, max = 1000) => {
            if (!text) {
                return max;
            }
            
            return max - text.length;
        };

        vm.image = false;
        vm.imageErrorMessage = false;

        let watchers = [];

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
                $scope.$watch('vm.imageErrorMessage', () => {
                    checkImage();
                })
            );

            watchers.push(
                $scope.$watch('vm.image', () => {
                    checkImage();
                })
            );

            watchers.push(
              $scope.$watch('vm.profile.shortDescription.value', function(newVal, oldVal) {
                  if (newVal && newVal.length > 1100) {
                      vm.profile.shortDescription.value = oldVal;
                  }
              })
            );

            watchers.push(
              $scope.$watch('vm.profile.achievements.value', function(newVal, oldVal) {
                  if (newVal && newVal.length > 700) {
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

        vm.moveUp = function(field, key, item) {
            if (key > 0) {
                vm.profile[field].splice(key, 1);
                vm.profile[field].splice(key - 1, 0, item);
            }
        };

        vm.moveDown = function(field, key, item) {
            if (key < vm.profile[field].length) {
                vm.profile[field].splice(key, 1);
                vm.profile[field].splice(key + 1, 0, item);
            }
        };

        function checkImage() {
            if (vm.image) {
                vm.profile.coverImage.file = vm.image.name;
                vm.coverImage = vm.image;
                vm.profile.coverImage.errors = null;
            }

            if (vm.imageErrorMessage) {
                vm.profile.coverImage.file = null;
                vm.profile.coverImage.errors = {};
                vm.profile.coverImage.errors.value = [];
                vm.profile.coverImage.errors.value.push({ message: vm.imageErrorMessage });
            }
        }

        vm.isFieldVisible = fieldName => {
            if (vm.group.type === groupTypes.DIRECTORATE) {
                return fieldName === 'shortDescription' || fieldName === 'services';
            } else {
                switch (vm.type) {
                    case 'basic':
                        return fieldName === 'shortDescription' || fieldName === 'achievements';
                    case 'complete-profile':
                        return fieldName === 'shortDescription' || fieldName === 'achievements' || fieldName === 'topics' || fieldName === 'description' || fieldName === 'collaborations' || fieldName === 'laboratories' || fieldName === 'url' || fieldName === 'topics' || fieldName === 'coverImage';
                    default:
                        return false;
                }
            }
        };
    }
})();
