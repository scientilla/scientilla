/* global angular */
(function () {
    angular
        .module('documentation')
        .component('bearerToken', {
            controller: controller,
            templateUrl: 'partials/bearer-token.html',
            controllerAs: 'vm',
            bindings: {

            }
        });

    controller.$inject = [
    ];

    function controller() {
        const vm = this;

        vm.$onInit = () => {
        };
    }

})();
