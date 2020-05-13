/* global angular */
(function () {
    angular
        .module('documentation')
        .component('documentationUserObjectTable', {
            controller: controller,
            templateUrl: 'partials/documentation-user-object-table.html',
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
