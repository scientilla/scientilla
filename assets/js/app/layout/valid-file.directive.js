(function () {
    'use strict';

    angular.module('components')
        .directive('validFile', function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, el) {
                    var maxSize = 500000;
                    el.bind('change', function() {

                        scope.$apply(function() {
                            scope.image.maxSizeError = false;
                            var fileSize = el[0].files[0].size;
                            if (fileSize > maxSize) {
                                scope.image.maxSizeError = 'Max file size exceeded (500kB)';
                                angular.element(el).val([]);
                            } else {
                                scope.image.file = el[0].files[0];
                            }
                        });
                    });
                }
            };
        });
})();