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

    profileAboutMeForm.$inject = ['ProfileService', 'AuthService', 'pathProfileImages', '$scope', 'taOptions', 'taTools'];

    function profileAboutMeForm(ProfileService, AuthService, pathProfileImages, $scope, taOptions, taTools) {
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

            taOptions.toolbar = [
                ['p', 'quote'],
                ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
                ['indent', 'outdent'],
                ['insertLink']
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

        vm.format = function (html) {
            return html.replace(/(<\/?(?:a|p|ul|ol|li|strong|b|em|i|u|strike|blockquote|br)[^>]*>)|<[^>]+>/ig, '$1')
                .replace(/ rel=("|\')(.*?)("|\')/gm, '')
                .replace(/ style=("|\')(.*?)("|\')/gm, '')
                .replace(/ class=("|\')(.*?)("|\')/gm, '')
                .replace(/ id=("|\')(.*?)("|\')/gm, '');
        };
    }

})();