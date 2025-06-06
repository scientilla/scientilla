/* global angular, _ */
(function () {
    angular.module("app").factory("ProjectService", controller);

    controller.$inject = [
        'Restangular',
        'EventsService',
        'ResearchEntitiesService',
        'DownloadService',
        '$http',
        'ValidateService',
        'ModalService',
        'GroupsService',
        'groupTypes',
        'projectTypeAgreement',
        'Prototyper',
        'ResearchItemTypesService'
    ];

    function controller(
        Restangular,
        EventsService,
        ResearchEntitiesService,
        DownloadService,
        $http,
        ValidateService,
        ModalService,
        GroupsService,
        groupTypes,
        projectTypeAgreement,
        Prototyper,
        ResearchItemTypesService
    ) {

        return {
            getAgreementOfGroup,
            get: ResearchEntitiesService.getProjects,
            getDiscarded: ResearchEntitiesService.getDiscardedProjects,
            getDrafts: ResearchEntitiesService.getProjectDrafts,
            create: ResearchEntitiesService.createDraft,
            update: ResearchEntitiesService.updateDraft,
            delete: ResearchEntitiesService.deleteDraft,
            multipleDelete: ResearchEntitiesService.deleteDrafts,
            copy: ResearchEntitiesService.copy,
            multipleCopy: ResearchEntitiesService.multipleCopy,
            verify,
            multipleVerify: ResearchEntitiesService.multipleVerify,
            unverify: ResearchEntitiesService.unverify,
            getSuggested: ResearchEntitiesService.getSuggestedProjects,
            discard: ResearchEntitiesService.discard,
            multipleDiscard: ResearchEntitiesService.multipleDiscard,
            filterFields,
            generateGroup,
            getActions,
            exportDownload,
            isValid,
            editAgreement: (researchEntity, draft) => ModalService.openAgreementForm(researchEntity, _.cloneDeep(draft)),
            getGroups,
            onChange,
            updateFilterQuery
        };

        /* jshint ignore:start */
        async function verify(researchEntity, researchItem) {
            const completeResearchItem = await ResearchEntitiesService.getProject(researchItem.id);
            await ResearchEntitiesService.verify('project', researchEntity, completeResearchItem);

            if (researchEntity.type === 'user') {
                await context.refreshSubResearchEntity();
            }
        }

        async function generateGroup(project, administrators = []) {
            if (project.group)
                return true;

            const prj = await Restangular.one('projects', project.id).customPUT({
                administratorIds: administrators.map(a => a.id)
            }, 'group');

            if (prj.group)
                EventsService.publish(EventsService.RESEARCH_ITEM_VERIFIED, prj);

        }

        async function getActions() {
            return await Restangular.all('projects').customGET('get-actions');
        }

        /* jshint ignore:end */

        function exportDownload(items, format = 'csv', url = projectExportUrl) {
            $http.post(url, {
                format: format,
                projectIds: items.map(d => d.id)
            }, {responseType: 'arraybuffer'})
                .then((res) => {
                    DownloadService.download(res.data, 'projects', format);
                });
        }

        function filterFields(project, fields) {
            if (!project.type)
                return {};
            const filteredProject = {};
            fields.forEach(key => filteredProject[key] = project[key] ? project[key] : null);
            return filteredProject;
        }

        function isValid(item, requiredFields, rules) {
            return _.isEmpty(ValidateService.validate(item, false, requiredFields, rules));
        }

        function getGroups(query = {}) {
            query.where.type = groupTypes.PROJECT;
            return GroupsService.getGroups(query);
        }

        /* jshint ignore:start */
        async function getAgreementOfGroup(group) {
            const response = await Restangular.one('projects').get({
                where: {
                    key: projectTypeAgreement,
                    group: group.id
                }
            });
            const agreements = response.items;
            return Prototyper.toAgreementModel(agreements[0]);
        }

        /* jshint ignore:end */

        function onChange(structure, values, key) {
            switch (key) {
                case 'projectType':
                    structure.title.visible = false;
                    structure.acronym.visible = false;
                    structure.pi.visible = false;
                    structure.proposer.visible = false;
                    structure.minYear.visible = false;
                    structure.maxYear.visible = false;
                    structure.status.visible = false;
                    structure.funding.visible = false;
                    structure.action.visible = false;
                    structure.category.visible = false;
                    structure.payment.visible = false;

                    switch (values[key]) {
                        case 'all':
                            delete values.acronym;
                            delete values.pi;
                            delete values.proposer;
                            delete values.funding;
                            delete values.action;
                            delete values.category;
                            delete values.payment;
                            structure.title.visible = true;
                            structure.minYear.visible = true;
                            structure.maxYear.visible = true;
                            structure.status.visible = true;
                            break;
                        case 'project_industrial':
                            delete values.acronym;
                            delete values.pi;
                            delete values.funding;
                            delete values.action;
                            structure.title.visible = true;
                            structure.proposer.visible = true;
                            structure.minYear.visible = true;
                            structure.maxYear.visible = true;
                            structure.category.visible = true;
                            structure.payment.visible = true;
                            structure.status.visible = true;
                            break;
                        case 'project_competitive':
                            delete values.proposer;
                            delete values.category;
                            delete values.payment;
                            structure.title.visible = true;
                            structure.acronym.visible = true;
                            structure.pi.visible = true;
                            structure.minYear.visible = true;
                            structure.maxYear.visible = true;
                            structure.status.visible = true;
                            structure.funding.visible = true;
                            structure.action.visible = true;
                            break;
                        default:
                            break;
                    }

                    break;
                default:
                    break;
            }
        }

        /* jshint ignore:start */
        async function updateFilterQuery(query) {
            if (_.has(query, 'where.type')) {
                switch (query.where.type) {
                    case projectTypeIndustrial:
                        if (_.has(query, 'where.status')) {
                            if (query.where.status === 'working') {
                                query.where.startDate = {
                                    '<=': moment().format('YYYY-MM-DD')
                                }

                                query.where.endDate = {
                                    '>=': moment().format('YYYY-MM-DD')
                                }
                            }

                            if (query.where.status === 'ended') {
                                query.where.endDate = {
                                    '<': moment().format('YYYY-MM-DD')
                                }
                            }

                            delete query.where.status;
                        }
                        break;
                    case projectTypeCompetitive:
                        break;
                    default:
                        const or = [];
                        const types = await ResearchItemTypesService.getTypes();
                        const projectTypeIndustrialId = types.find(type => type.key === projectTypeIndustrial).id;
                        const projectTypeCompetitiveId = types.find(type => type.key === projectTypeCompetitive).id;

                        switch (query.where.status) {
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
                                    status: _.cloneDeep(query.where.status)
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
                                    status: _.cloneDeep(query.where.status)
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

                        query.where.or = or;

                        delete query.where.status;
                        delete query.where.type;

                        break;
                }
            }

            return query;
        }

        /* jshint ignore:end */
    }
})();
