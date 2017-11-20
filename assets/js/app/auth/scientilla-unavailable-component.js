(function () {
    'use strict';

    angular.module('auth')
        .component('scientillaUnavailable', {
            templateUrl: 'partials/scientilla-unavailable.html',
            controller: scientillaUnavailable,
            controllerAs: 'vm'
        });


    scientillaUnavailable.$inject = [
        'Restangular',
        'path',
        'AuthService'
    ];

    function scientillaUnavailable(Restangular, path, AuthService) {
        const vm = this;
        vm.ping = ping;


        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };

        function ping() {
            const url = 'ping';
            return Restangular.one(url).get()
                .then(() => {
                    if (AuthService.isAvailable)
                        path.goTo('login');
                });
        }

    }

})();