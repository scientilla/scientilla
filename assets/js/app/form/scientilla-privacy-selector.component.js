(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaPrivacySelector', {
            templateUrl: 'partials/scientilla-privacy-selector.html',
            controller: scientillaPrivacySelector,
            controllerAs: 'vm',
            bindings: {
                contextObject: '<?',
                contextString: '@?',
                profile: '<',
                model: '=?',
                errors: '<?'
            }
        });

    scientillaPrivacySelector.$inject = ['ProfileService', '$scope'];

    function scientillaPrivacySelector(ProfileService, $scope) {
        const vm = this;

        vm.cssClass = '';

        let showPublicOption = false;
        let showHiddenOption = false;
        let showInvisibleOption = false;

        const titlesRegex = RegExp(/^titles\[([0-9]*?)]/);
        const interestsRegex = RegExp(/^interests\[([0-9]*?)]/);
        const educationRegex = RegExp(/^education\[([0-9]*?)]/);
        const certificatesRegex = RegExp(/^certificates\[([0-9]*?)]/);
        const skillCategoryRegex = RegExp(/^skill-category\[([0-9]*?)]/);
        const skillRegex = RegExp(/^skill\[([0-9]*?)]\[([0-9]*?)]/);
        const groupsRegex = RegExp(/^groups\[([0-9]*?)]/);
        const externalExperiencesRegex = RegExp(/^experiencesExternal\[([0-9]*?)]/);
        const internalExperiencesRegex = RegExp(/^experiencesInternal\[([0-9]*?)]/);
        const topicsRegex = RegExp(/^topics\[([0-9]*?)]/);
        const servicesRegex = RegExp(/^services\[([0-9]*?)]/);

        const defaultOption = 'hidden';

        let watchers = [];

        vm.isOpen = false;

        vm.$onInit = function () {
            const cssClasses = [];

            switch (true) {
                case typeof vm.contextString !== 'undefined':
                    vm.context = vm.contextString;
                    break;
                case typeof vm.contextObject !== 'undefined':
                    vm.context = vm.contextObject;
                    break;
                default:
                    const date = new Date();
                    const dateElements = [
                        date.getYear(),
                        date.getMonth(),
                        date.getDate(),
                        date.getHours(),
                        date.getMinutes(),
                        date.getSeconds(),
                        date.getMilliseconds()
                    ];
                    vm.context = dateElements.join('') + Math.floor(Math.random() * 10000);
                    break;
            }


            if (_.isNil(vm.model)) {
                vm.model = defaultOption;
            }

            switch (true) {
                case internalExperiencesRegex.test(vm.context) :
                    showHiddenOption = true;
                    break;
                case
                    vm.context === 'username' ||
                    vm.context === 'name' ||
                    vm.context === 'surname' ||
                    vm.context === 'jobTitle' ||
                    vm.context === 'roleCategory' ||
                    vm.context === 'phone' ||
                    groupsRegex.test(vm.context)
                :
                    if (vm.profile.hidden) {
                        showHiddenOption = true;
                    } else{
                        showPublicOption = true;
                    }
                    break;
                case
                    vm.context === 'image' ||
                    vm.context === 'description' ||
                    vm.context === 'role' ||
                    vm.context === 'website' ||
                    vm.context === 'address' ||
                    vm.context === 'linkedin' ||
                    vm.context === 'twitter' ||
                    vm.context === 'facebook' ||
                    vm.context === 'instagram' ||
                    vm.context === 'researchgate' ||
                    vm.context === 'googleScholar' ||
                    vm.context === 'github' ||
                    vm.context === 'bitbucket' ||
                    vm.context === 'youtube' ||
                    vm.context === 'flickr' ||
                    titlesRegex.test(vm.context) ||
                    interestsRegex.test(vm.context) ||
                    educationRegex.test(vm.context) ||
                    certificatesRegex.test(vm.context) ||
                    skillCategoryRegex.test(vm.context) ||
                    skillRegex.test(vm.context) ||
                    externalExperiencesRegex.test(vm.context) ||
                    vm.context === 'collaborations' ||
                    vm.context === 'laboratories' ||
                    topicsRegex.test(vm.context) ||
                    vm.context === 'coverImage' ||
                    vm.context === 'url'
                :
                    if (!vm.profile.hidden) {
                        showPublicOption = true;
                    }
                    showHiddenOption = true;
                    showInvisibleOption = true;
                    break;
                case vm.context === 'shortDescription' ||
                    servicesRegex.test(vm.context) ||
                    vm.context === 'achievements'
                :
                    showPublicOption = true;
                    break;
                case
                    vm.context === 'nationality' ||
                    vm.context === 'dateOfBirth'
                :
                    showHiddenOption = true;
                    break;
                default:
                    break;
            }

            vm.options = [
                'public',
                'hidden',
                'invisible'
            ];

            vm.enabledOptions = [];
            if (showPublicOption) {
                vm.enabledOptions.push('public');
            }

            if (showHiddenOption) {
                vm.enabledOptions.push('hidden');
            }

            if (showInvisibleOption) {
                vm.enabledOptions.push('invisible');
            }

            // Add css class to remove the margin
            if (
                titlesRegex.test(vm.context) ||
                interestsRegex.test(vm.context) ||
                vm.context === 'documents' ||
                vm.context === 'accomplishments' ||
                groupsRegex.test(vm.context)
            ) {
                cssClasses.push('no-label');
            }

            if (vm.options.length === 1) {
                cssClasses.push('one-option');
            }

            // Has errors? Add error class
            if (!_.isNil(vm.errors)) {
                cssClasses.push('is-invalid');
            }

            // Map array to class string
            vm.cssClass = cssClasses.join(' ');


            // Listen when errors are been changed
            watchers.push($scope.$watch('vm.errors', (newValue, oldValue) => {
                const className = 'is-invalid';

                if (!_.isNil(newValue)) {
                    cssClasses.push(className);
                }

                if (!_.isNil(oldValue) && _.isNil(newValue)) {
                    const index = cssClasses.indexOf(className);

                    if (index > -1) {
                        cssClasses.splice(index, 1);
                    }
                }

                vm.cssClass = cssClasses.join(' ');
            }));
        };

        vm.$onDestroy = function () {
            _.forEach(watchers, function (watcher) {
                watcher();
            });
            watchers = [];
        };

        vm.isOptionDisabled = option => {
            if (vm.enabledOptions.includes(option)) {
                return false;
            }

            return true;
        };

        vm.getDropdownText = option => {
            return ProfileService.getPrivacyDropdownText(option);
        };

        vm.getSelectedOptionIcon = () => {
            switch(vm.model) {
                case 'public':
                    return 'fas fa-globe-europe';
                case 'hidden':
                    return 'fas fa-lock';
                case 'invisible':
                    return 'fas fa-eye-slash';
                default:
                    return 'No correct option!';
            }
        };

        vm.setModel = option => {
            if (!vm.isOptionDisabled(option)) {
                vm.model = option;
            }
        };
    }

})();
