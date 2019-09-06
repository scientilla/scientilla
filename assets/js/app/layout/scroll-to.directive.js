(function () {
    'use strict';

    angular.module('components')
        .directive('scrollTo', ['$window', ($window) => {
            return {
                restrict: 'A',
                link: function (scope, $element, attr) {
                    $element.on('click', evt => {

                        const location = angular.element(attr.href);
                        const header = angular.element('.toolbar-header')[0];
                        const top = location.offset().top - header.offsetHeight;

                        evt.preventDefault();

                        angular.element('html, body').animate({scrollTop: top});
                    });
                }
            };
        }]);
})();