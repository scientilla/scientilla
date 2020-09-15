/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaPatentVerifiedList', {
            templateUrl: 'partials/scientilla-patent-verified-list.html',
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

        vm.patentListSections = patentListSections;
        vm.patents = [];
        vm.onFilter = onFilter;
        vm.exportDownload = patents => PatentService.exportDownload(patents, 'csv');

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

            vm.patents = await PatentService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();