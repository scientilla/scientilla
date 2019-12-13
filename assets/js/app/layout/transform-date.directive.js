(function () {
    'use strict';

    angular.module('components')
        .directive('transformDate', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attr) {
                    var ngModel = attr.ngModel;
                    var value = _.propertyOf(scope)(ngModel);
                    if (!_.isUndefined(value)) {
                        if (_.isString(value)) {
                            var lastIndexOfDot = _.lastIndexOf(ngModel, '.');
                            if (lastIndexOfDot < 0) {
                                scope[ngModel] = new Date(value);
                            } else {
                                var parentValue = _.propertyOf(scope)(ngModel.substr(0, lastIndexOfDot));
                                parentValue[ngModel.substr(lastIndexOfDot + 1)] = new Date(value);
                            }
                        }
                    }
                }
            };
        });
})();