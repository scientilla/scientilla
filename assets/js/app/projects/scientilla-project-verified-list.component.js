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
        'accomplishmentListSections',
        'AuthService',
        'ResearchItemService',
        'ResearchItemTypesService'
    ];

    function controller(context,
                        ProjectService,
                        EventsService,
                        projectListSections,
                        AuthService,
                        ResearchItemService,
                        ResearchItemTypesService) {
        const vm = this;

        vm.projectListSections = projectListSections;
        vm.projects = [];
        vm.unverify = ProjectService.unverify;
        vm.isUnverifying = ResearchItemService.isUnverifying;
        vm.onFilter = onFilter;
        vm.exportDownload = projects => ProjectService.exportDownload(projects, 'csv');

        let query = {};

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            vm.editable = vm.section === projectListSections.VERIFIED && !AuthService.user.isViewOnly();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
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
            // Todo favorites

            query = q;

            if (query && query.where && query.where.type) {
                const types = await ResearchItemTypesService.getTypes();
                const type = types.find(type => type.key === query.where.type);
                query.where.type = type.id;
            }

            vm.projects = await ProjectService.get(vm.researchEntity, query, favorites);
            console.log(vm.projects);
        }
        /* jshint ignore:end */
    }

})();