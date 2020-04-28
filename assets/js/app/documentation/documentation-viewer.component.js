/* global angular */
(function () {
    angular
        .module('documentation')
        .component('documentationViewer', {
            controller: controller,
            templateUrl: 'partials/documentation-viewer.html',
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
