/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaAccomplishmentVerifiedList', {
            templateUrl: 'partials/scientilla-accomplishment-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'context',
        'accomplishmentListSections'
    ];

    function controller(context, accomplishmentListSections) {
        const vm = this;
        vm.accomplishmentListSections = accomplishmentListSections;
        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
        };
        /* jshint ignore:end */


        vm.$onDestroy = function () {
        };
    }

})();