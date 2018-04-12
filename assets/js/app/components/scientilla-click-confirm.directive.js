(function () {
    'use strict';

    angular.module('components')
        .directive('scientillaClickConfirm', ['ModalService', (ModalService) => {
            return {
                priority: 1,
                terminal: true,
                link: function (scope, element, attr) {
                    const title = attr.scientillaClickConfirm || 'Are you sure?';
                    const msg = '';
                    const clickAction = attr.ngClick;
                    element.bind('click', function () {
                        ModalService
                            .confirm(title, msg)
                            .then(function (res) {
                                if (res === 0)
                                    scope.$eval(clickAction);
                            });
                    });
                }
            };
        }]);
})();