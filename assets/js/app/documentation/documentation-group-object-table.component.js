/* global angular */
(function () {
    angular
        .module('documentation')
        .component('documentationGroupObjectTable', {
            controller: controller,
            templateUrl: 'partials/documentation-group-object-table.html',
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
