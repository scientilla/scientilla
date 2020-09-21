/* global angular */
(function () {
    angular
        .module('users')
        .component('userProfileTable', {
            templateUrl: 'partials/user-profile-table.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                user: '<'
            }
        });

    controller.$inject = [];

    function controller() {
        const vm = this;

        vm.$onInit = () => {

        };
    }
})();
