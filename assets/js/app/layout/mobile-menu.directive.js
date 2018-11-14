(function () {
    'use strict';

    angular.module('components')
        .directive('mobileMenu', [() => {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    element.bind('click', () => {
                        if (document.body.classList.contains('mobile-menu-is-open')) {
                            document.body.classList.remove('mobile-menu-is-open');
                        } else {
                            document.body.classList.add('mobile-menu-is-open');
                        }
                    });
                }
            };
        }]);
})();