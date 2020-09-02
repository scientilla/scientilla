/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaProjectsList', {
            templateUrl: 'partials/scientilla-projects-list.html',
            controller: scientillaProjectsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                section: '<'
            }
        });

    scientillaProjectsList.$inject = [
        'ProjectService',
        'projectListSections',
        '$element',
        '$timeout'
    ];

    function scientillaProjectsList(
        ProjectService,
        projectListSections,
        $element,
        $timeout
    ) {
        const vm = this;

        vm.name = 'projects-list';
        vm.shouldBeReloaded = true;

        vm.projects = [];
        vm.onFilter = onFilter;
        vm.exportDownload = projects => ProjectService.exportDownload(projects, 'csv');

        let query = {};

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        vm.reload = function () {

        };

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            vm.projects = await ProjectService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();