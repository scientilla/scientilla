/* global angular */
(function () {
    'use strict';

    angular.module('projects')
        .component('scientillaProjectVerifiedList', {
            templateUrl: 'partials/scientilla-project-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'ProjectService',
        'projectListSections',
        'context',
        'groupTypes',
        'ResearchItemService',
        'EventsService'
    ];

    function controller(
        ProjectService,
        projectListSections,
        context,
        groupTypes,
        ResearchItemService,
        EventsService
    ) {
        const vm = this;

        vm.projectListSections = projectListSections;
        vm.projects = [];
        vm.unverify = ProjectService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
        vm.onFilter = onFilter;
        vm.exportDownload = projects => ProjectService.exportDownload(projects, 'csv');
        vm.onChange = onChange;
        vm.showActions = showActions;

        let query = {
            where: {}
        };

        vm.subResearchEntity = context.getSubResearchEntity();

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED
            ], updateList);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            return onFilter(query);
        }

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = await ProjectService.updateFilterQuery(q);

            vm.projects = await ProjectService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */

        function onChange(structure, values, key) {
            ProjectService.onChange(structure, values, key);
        }

        function showActions() {
            return vm.subResearchEntity.getType() === 'group' && (
                vm.subResearchEntity.type === groupTypes.INITIATIVE ||
                vm.subResearchEntity.type === groupTypes.PROJECT
            );
        }
    }

})();
