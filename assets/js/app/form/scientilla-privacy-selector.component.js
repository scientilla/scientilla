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
        const experiencesRegex = RegExp(/^experiences\[([0-9]*?)]/);
        const educationRegex = RegExp(/^education\[([0-9]*?)]/);
        const certificatesRegex = RegExp(/^certificates\[([0-9]*?)]/);
        const skillCategoryRegex = RegExp(/^skill-category\[([0-9]*?)]/);
        const skillRegex = RegExp(/^skill\[([0-9]*?)]\[([0-9]*?)]/);
        const centersRegex = RegExp(/^centers\[([0-9]*?)]/);
        const researchLinesRegex = RegExp(/^researchLines\[([0-9]*?)]/);
        const facilitiesRegex = RegExp(/^facilities\[([0-9]*?)]/);

        const defaultOption = 'hidden';

        let watchers = [];

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
                case
                    vm.context === 'username' ||
                    vm.context === 'name' ||
                    vm.context === 'surname' ||
                    vm.context === 'jobTitle' ||
                    vm.context === 'phone' ||
                    vm.context === 'directorate' ||
                    vm.context === 'office' ||
                    centersRegex.test(vm.context) ||
                    researchLinesRegex.test(vm.context) ||
                    facilitiesRegex.test(vm.context)
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
                    vm.context === 'github' ||
                    vm.context === 'bitbucket' ||
                    vm.context === 'youtube' ||
                    vm.context === 'flickr' ||
                    titlesRegex.test(vm.context) ||
                    interestsRegex.test(vm.context) ||
                    experiencesRegex.test(vm.context) ||
                    educationRegex.test(vm.context) ||
                    certificatesRegex.test(vm.context) ||
                    skillCategoryRegex.test(vm.context) ||
                    skillRegex.test(vm.context)
                :
                    if (!vm.profile.hidden) {
                        showPublicOption = true;
                    }
                    showHiddenOption = true;
                    showInvisibleOption = true;
                    break;
                case
                    vm.context === 'documents' ||
                    vm.context === 'accomplishments'
                :
                    showHiddenOption = true;
                    showInvisibleOption = true;
                    break;
                default:
                    break;
            }

            vm.options = [];
            if (showPublicOption) {
                vm.options.push('public');
            }

            if (showHiddenOption) {
                vm.options.push('hidden');
            }

            if (showInvisibleOption) {
                vm.options.push('invisible');
            }

            // Add css class to remove the margin
            if (
                titlesRegex.test(vm.context) ||
                interestsRegex.test(vm.context) ||
                vm.context === 'documents' ||
                vm.context === 'accomplishments' ||
                centersRegex.test(vm.context) ||
                researchLinesRegex.test(vm.context) ||
                facilitiesRegex.test(vm.context)
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

        vm.changeOption = $event => {
            const radioButtons = angular.element('[data-context="' + vm.context + '"]');
            let index = 0;

            $event.stopPropagation();

            for (let i = 0; i < radioButtons.length; i++) {
                const radiobutton = radioButtons[i];
                if (radiobutton.checked) {
                    if (i === radioButtons.length - 1) {
                        index = 0;
                    } else {
                        index = i + 1;
                    }

                    break;
                }
            }

            const newSelectedRadioButton = radioButtons[index];
            const newSelectedOption = newSelectedRadioButton.getAttribute('value');
            vm.model = newSelectedOption;
        };

        vm.getTooltipText = () => {
            return ProfileService.getPrivacyTooltipText(vm.options);
        };
    }

})();