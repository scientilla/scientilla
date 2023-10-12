(function () {
    'use strict';

    angular.module('components')
        .directive('validImage', function() {
            return {
                restrict: 'A',
                scope: {
                    image: '=',
                    maxSize: '@', // In kB
                    minWidth: '@',  // In px
                    minHeight: '@',  // In px
                    imageErrorMessage: '=',
                },
                link: function(scope, el) {
                    const parsedMaxSize = parseInt(scope.maxSize) || 0;
                    const parsedMinWidth = parseInt(scope.minWidth) || 0;
                    const parsedMinHeight = parseInt(scope.minHeight) || 0;
                    el.bind('change', function() {

                        if (el.length > 0 && el[0].files.length > 0) {
                            const file = el[0].files[0];
                            const sizePromise = new Promise((resolve, reject) => {
                                if (file.size > parsedMaxSize * 1000) {
                                    reject(`Max file size exceeded (${parsedMaxSize}kB)`);
                                } else {
                                    resolve();
                                }
                            });

                            const resolutionPromise = new Promise((resolve, reject) => {
                                if (parsedMinWidth > 0 || parsedMinHeight > 0) {
                                    const img = new Image();
                                    const objectUrl = URL.createObjectURL(file);

                                    img.onload = function() {
                                        const loadedImage = this;
                                        switch (true) {
                                            case parsedMinWidth > 0 && parsedMinHeight > 0:
                                                if (loadedImage.width < parsedMinWidth || loadedImage.height < parsedMinHeight) {
                                                    reject(`The minimum resolution is ${parsedMinWidth}px (width) by ${parsedMinHeight}px (height)`);
                                                } else {
                                                    resolve();
                                                }
                                                break;
                                            case parsedMinWidth === 0 && parsedMinHeight > 0:
                                                if (loadedImage.height < parsedMinHeight) {
                                                    reject(`The minimum height is ${parsedMinHeight}`);
                                                } else {
                                                    resolve();
                                                }
                                                break;
                                            case parsedMinWidth > 0 && parsedMinHeight === 0:
                                                if (loadedImage.height < parsedMinWidth) {
                                                    reject(`The minimum width is ${parsedMinWidth}`);
                                                } else {
                                                    resolve();
                                                }
                                                break;
                                            default:
                                                resolve();
                                                break;
                                        }
                                        URL.revokeObjectURL(objectUrl);
                                    };
                                    img.src = objectUrl;
                                } else {
                                    resolve();
                                }
                            });

                            Promise.all([sizePromise, resolutionPromise]).then((values) => {
                                scope.image = el[0].files[0];
                                scope.imageErrorMessage = false;
                                scope.$apply();
                            }).catch(error => {
                                scope.imageErrorMessage = error;
                                scope.image = false;
                                angular.element(el).val([]);
                                scope.$apply();
                            });
                        }

                    });
                }
            };
        });
})();
