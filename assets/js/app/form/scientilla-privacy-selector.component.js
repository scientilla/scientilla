(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaPrivacySelector', {
            templateUrl: 'partials/scientilla-privacy-selector.html',
            controller: scientillaPrivacySelector,
            controllerAs: 'vm',
            bindings: {
                cssClass: '@?',
                contextObject: '<?',
                contextString: '@?',
                model: '=?',
                disableInvisible: '<?'
            }
        });

    scientillaPrivacySelector.$inject = ['ProfileService'];

    function scientillaPrivacySelector(ProfileService) {
        const vm = this;

        const defaultOptions = ['locked', 'public', 'invisible'];
        const defaultOption = 'locked';

        vm.$onInit = function () {
            if (typeof vm.model === 'undefined') {
                vm.model = defaultOption;
            }

            if (typeof vm.disableInvisible !== 'undefined' || vm.disableInvisible === true) {
                defaultOptions.splice(defaultOptions.indexOf('invisible'), 1);
            }

            switch(true) {
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

            vm.options = defaultOptions;
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
            return ProfileService.getPrivacyTooltipText({disableInvisible: vm.disableInvisible});
        };
    }

})();