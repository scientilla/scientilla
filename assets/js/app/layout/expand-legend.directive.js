(function () {
    'use strict';

    angular.module('components')
        .directive('expandLegend', [() => {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    const button = element.find('.js-see-more-less');
                    const legend = element.find('.js-legend')[0];

                    button.bind('click', (e) => {
                        e.currentTarget.classList.toggle('show-less');
                        legend.classList.toggle('expand');
                    });
                }
            };
        }]);
})();