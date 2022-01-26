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
        'context',
        'ResearchItemTypesService'
    ];

    function controller(
        ProjectService,
        projectListSections,
        context,
        ResearchItemTypesService
    ) {
        const vm = this;

        vm.projectListSections = projectListSections;
        vm.projects = [];
        vm.onFilter = onFilter;
        vm.exportDownload = projects => ProjectService.exportDownload(projects, 'csv');
        vm.onChange = onChange;

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

            if (_.has(q, 'where.type')) {
                switch (q.where.type) {
                    case projectTypeIndustrial:
                        if (_.has(q, 'where.status')) {
                            if (q.where.status === 'working') {
                                q.where.startDate = {
                                    '<=': moment().format('YYYY-MM-DD')
                                }

                                q.where.endDate = {
                                    '>=': moment().format('YYYY-MM-DD')
                                }
                            }

                            if (q.where.status === 'ended') {
                                q.where.endDate = {
                                    '<': moment().format('YYYY-MM-DD')
                                }
                            }

                            delete q.where.status;
                        }
                        break;
                    case projectTypeCompetitive:
                        break;
                    default:
                        const or = [];
                        const types = await ResearchItemTypesService.getTypes();
                        const projectTypeIndustrialId = types.find(type => type.key === projectTypeIndustrial).id;
                        const projectTypeCompetitiveId = types.find(type => type.key === projectTypeCompetitive).id;

                        switch (q.where.status) {
                            case 'working':
                                or.push({
                                    type: projectTypeIndustrialId,
                                    startDate: {
                                        '<=': moment().format('YYYY-MM-DD')
                                    },
                                    endDate: {
                                        '>=': moment().format('YYYY-MM-DD')
                                    }
                                });
                                or.push({
                                    type: projectTypeCompetitiveId,
                                    status: _.cloneDeep(q.where.status)
                                });
                                break;
                            case 'ended':
                                or.push({
                                    type: projectTypeIndustrialId,
                                    endDate: {
                                        '<': moment().format('YYYY-MM-DD')
                                    }
                                });
                                or.push({
                                    type: projectTypeCompetitiveId,
                                    status: _.cloneDeep(q.where.status)
                                });
                                break;
                            default:
                                or.push({
                                    type: projectTypeIndustrialId
                                });
                                or.push({
                                    type: projectTypeCompetitiveId
                                });
                                break;
                        }

                        q.where.or = or;

                        delete q.where.status;
                        delete q.where.type;

                        break;
                }
            }

            query = q;

            vm.projects = await ProjectService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */

        function onChange(structure, values, key) {
            ProjectService.onChange(structure, values, key);
        }
    }

})();
