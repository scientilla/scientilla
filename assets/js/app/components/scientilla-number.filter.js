(function () {
    'use strict';

    angular.module('components')
        .filter('scientillaNumber', () => {
            return (number, digits) => {
                const num = parseFloat(number);
                if (!num) return '0';
                if (digits >= 0)
                    return num.toFixed(digits);

                return num.toString();
            };
        });
})();