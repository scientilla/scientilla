/* global angular */
(function () {
    'use strict';

    angular.module('projects')
        .component('scientillaProjectSuggestedList', {
            templateUrl: 'partials/scientilla-project-suggested-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'ProjectService',
        'projectListSections',
        'EventsService',
        'ModalService'
    ];

    function controller(context, ProjectService, projectListSections, EventsService, ModalService) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = ProjectService.isValid;

        vm.verify = (project) => ProjectService.verify(vm.researchEntity, project);
        vm.discard = (project) => ProjectService.discard(vm.researchEntity, project);
        vm.multipleVerify = (projects) => ProjectService.multipleVerify(vm.researchEntity, projects);
        vm.multipleDiscard = (projects) => ProjectService.multipleDiscard(vm.researchEntity, projects);
        vm.projectListSections = projectListSections;
        vm.onChange = onChange;

        let query = {};

        /* jshint ignore:start */
        vm.$onInit = async function () {
            const subResearchEntity = await context.getSubResearchEntity();
            vm.researchEntity = await context.getResearchEntity();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED,
                EventsService.RESEARCH_ITEM_DISCARDED,
            ], updateList);

            if (subResearchEntity.getType() === 'user' && !subResearchEntity.alreadyOpenedSuggested) {
                ModalService.openWizard(['alias-edit'], {
                    isClosable: true,
                    size: 'lg'
                });
                subResearchEntity.alreadyOpenedSuggested = true;
                subResearchEntity.save();
            }
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            return onFilter(query);
        }

        async function onFilter(q) {
            query = q;

            if (!vm.researchEntity) {
                vm.researchEntity = await context.getResearchEntity();
            }

            const isDiscarded = q.where.discarded;
            let tmpQuery = _.cloneDeep(q);
            delete tmpQuery.where.discarded;

            tmpQuery = await ProjectService.updateFilterQuery(tmpQuery);

            if (isDiscarded) {
                vm.projects = await ProjectService.getDiscarded(vm.researchEntity, tmpQuery);
            } else {
                vm.projects = await ProjectService.getSuggested(vm.researchEntity, tmpQuery);
            }
        }

        /* jshint ignore:end */

        function onChange(structure, values, key) {
            ProjectService.onChange(structure, values, key);
        }
    }

})();
