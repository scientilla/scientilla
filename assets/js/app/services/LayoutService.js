(function () {
    'use strict';
    angular.module('services').factory('LayoutService', LayoutService);

    LayoutService.$inject = ['$timeout'];

    function LayoutService($timeout) {
        const service = {};

        let footerTimer = null;
        let headerTimer = null;

        service.footerHeight = 0;
        service.headerHeight = 0;

        function checkHeader() {
            let $header = $('.js-header'),
                height  = $header.outerHeight(true);

            service.headerHeight = height;
            //console.log('Header: ', height);
        }

        function addHeaderTimer() {
            $timeout.cancel(headerTimer);
            headerTimer = $timeout(function() {
                checkHeader();
            }, 500);
        }

        service.fixedHeader = function() {
            addHeaderTimer();
            $(window).resize(function() {
                addHeaderTimer();
            });
        };

        function checkFooter() {
            let $footer = $('.js-footer'),
                height  = $footer.outerHeight(true);

            service.footerHeight = height;
            //console.log('Footer: ', height);
        }

        function addFooterTimer() {
            $timeout.cancel(footerTimer);
            footerTimer = $timeout(function() {
                checkFooter();
            }, 500);
        }

        service.stickyFooter = function() {
            addFooterTimer();
            $(window).resize(function() {
                addFooterTimer();
            });
        };

        return service;
    }
})();