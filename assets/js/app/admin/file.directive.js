(function () {
    'use strict';

    angular.module('admin')
        .directive('file', function ($parse) {
            return {
                restrict: 'A',

                link: function (scope, element, attrs) {
                    var model = $parse(attrs.file),
                        modelSetter = model.assign;

                    element.bind('change', function () {
                        // Call apply on scope, it checks for value changes and reflect them on UI
                        scope.$apply(function () {
                            // Set the model value
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        });
})();