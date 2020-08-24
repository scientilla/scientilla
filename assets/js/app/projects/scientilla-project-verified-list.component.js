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
        'context',
        'ProjectService',
        'EventsService',
        'projectListSections',
        'AuthService',
        'ResearchItemService'
    ];

    function controller(context,
                        ProjectService,
                        EventsService,
                        projectListSections,
                        AuthService,
                        ResearchItemService) {
        const vm = this;

        vm.projectListSections = projectListSections;
        vm.projects = [];
        vm.unverify = ProjectService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
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
            EventsService.unsubscribeAll(vm);
        };

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;
            // Todo favorites

            query = q;

            vm.projects = await ProjectService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();