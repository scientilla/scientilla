/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaProjectVerifiedList', {
            templateUrl: 'partials/scientilla-project-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'ProjectService',
        'projectListSections',
        'context'
    ];

    function controller(
        ProjectService,
        projectListSections,
        context
    ) {
        const vm = this;

        vm.projectListSections = projectListSections;
        vm.projects = [];
        vm.onFilter = onFilter;
        vm.exportDownload = projects => ProjectService.exportDownload(projects, 'csv');

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

        function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            return ProjectService.get(vm.researchEntity, query, favorites)
                .then(projects => {
                    vm.projects = projects;
                });
        }
    }

})();