(function () {
    'use strict';

    angular.module('cookies')
        .component('cookieConsent', {
            templateUrl: 'partials/cookie-consent.html',
            controller: cookieConsent,
            controllerAs: 'vm',
            transclude: true,
            bindings: {}
        });


    cookieConsent.$inject = ['$cookies'];

    function cookieConsent($cookies) {
        const vm = this;

        vm.consent = $cookies.get('consent') || false;

        vm.$onInit = function () {

        };

        vm.$onDestroy = function () {

        };

        vm.accept = () => {
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 365);
            $cookies.put('consent', true, {'expires': expireDate});
            vm.consent = true;
        };
    }
})();