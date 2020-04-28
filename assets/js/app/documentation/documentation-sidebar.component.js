/* global angular */
(function () {
    angular
        .module('documentation')
        .component('documentationSidebar', {
            controller: controller,
            templateUrl: 'partials/documentation-sidebar.html',
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
