/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaProject', {
            templateUrl: 'partials/scientilla-project.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                project: '<'
            }
        });

    controller.$inject = ['GroupsService'];

    function controller(GroupsService) {

        const vm = this;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            console.log(vm.project.plain());
        };
        /* jshint ignore:end */

        vm.getTypeTitle = GroupsService.getTypeTitle;

        vm.lines = _.uniq(vm.project.lines.map(line => line.description));
    }
})();