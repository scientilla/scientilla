(function () {
    'use strict';

    angular.module('components')
        .directive('fixedHeader', [() => {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    let container = angular.element('.js-main-container')[0],
                        header    = element[0],
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

                        if (header) {
                            height = header.offsetHeight;
                            container.style.paddingTop = height + 'px';
                        }
                    }

                    loadImages().then(fixedHeader);
                }
            };
        }]);
})();