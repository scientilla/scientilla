angular.
    module('components').
    filter('addDateOffset', ['DateService', function (DateService) {
        return function (input) {
            return DateService.toDate(input);
        };
    }]);