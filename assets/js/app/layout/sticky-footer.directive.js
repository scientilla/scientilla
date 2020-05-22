(function () {
    'use strict';

    angular.module('components')
        .directive('stickyFooter', ['$window', '$timeout', ($window, $timeout) => {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    let container = angular.element('.js-main-container')[0],
                        footer    = element[0],
                        images    = element.find('img'),
                        timer     = null;

                    const promise = [];

                    function addPromise(i) {
                        promise.push(new Promise((resolve, reject) => {
                            images[i].onload = () => {
                                resolve();
                            };

                            images[i].onerror = () => {
                                reject();
                            };
                        }));
                    }

                    function loadImages() {
                        for (let i = 0; i < images.length; i++) {
                            addPromise(i);
                        }

                        return Promise.all(promise);
                    }


                    function stickyFooter(){
                        let height = 0;

                        if (footer && container) {
                            height = footer.offsetHeight;
                            container.style.paddingBottom = height + 'px';
                        }
                    }

                    loadImages().then(() => {
                        $timeout(function () {
                            stickyFooter();
                        }, 500);
                    });

                    angular.element($window).bind('resize', function(){
                        $timeout.cancel(timer);
                        timer = $timeout(function() {
                            stickyFooter();
                        }, 500);
                    });
                }
            };
        }]);
})();