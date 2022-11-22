/* global angular */
(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatentFamilyVerifiedList', {
            templateUrl: 'partials/scientilla-patent-family-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'PatentService',
        'patentListSections',
        'context'
    ];

    function controller(
        PatentService,
        patentListSections,
        context
    ) {
        const vm = this;

        vm.patentFamilyListSections = patentFamilyListSections;
        vm.patentFamilies = [];
        vm.onFilter = onFilter;
        vm.exportDownload = patentFamilies => PatentService.exportDownload(patentFamilies, 'csv');

        let query = {
            where: {}
        };

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {

        };

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            vm.patentFamilies = await PatentService.getFamilies(vm.researchEntity, query, favorites);
            vm.patentFamilies = [{}];
        }
        /* jshint ignore:end */
    }

})();
