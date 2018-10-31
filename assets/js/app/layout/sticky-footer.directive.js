(function () {
    'use strict';

    angular.module('components')
        .directive('stickyFooter', [() => {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    let container = angular.element('.js-main-container')[0],
                        footer    = element[0],
                        images    = element.find('img');

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


                    function fixedHeader(){
                        let height = 0;

                        if (footer) {
                            height = footer.offsetHeight;
                            container.style.paddingBottom = height + 'px';
                        }
                    }

                    loadImages().then(fixedHeader);
                }
            };
        }]);
})();