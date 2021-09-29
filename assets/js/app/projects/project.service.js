/* global angular */
(function () {
    angular.module("app").factory("ProjectService", controller);

    const fields = {
        project_agreement: [
            'authorsStr',
            'startYear',
            'endYear',
            'type',
            'projectData'
        ]
    };

    controller.$inject = [
        'Restangular',
        'EventsService',
        'ResearchEntitiesService',
        '$http',
        'ValidateService',
        'ModalService',
        'GroupsService',
        'groupTypes',
        'projectTypeAgreement',
        'Prototyper'
    ];

    function controller(
        Restangular,
        EventsService,
        ResearchEntitiesService,
        $http,
        ValidateService,
        ModalService,
        GroupsService,
        groupTypes,
        projectTypeAgreement,
        Prototyper
    ) {

        return {
            getAgreementOfGroup,
            get: ResearchEntitiesService.getProjects,
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
            filterFields,
            generateGroup,
            exportDownload,
            isValid,
            editAgreement: (researchEntity, draft) => ModalService.openAgreementForm(researchEntity, _.cloneDeep(draft)),
            getGroups,
            onChange
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
        /* jshint ignore:end */

        function exportDownload(items, format = 'csv', filename = projectDownloadFileName, url = projectExportUrl) {
            $http.post(url, {
                format: format,
                projectIds: items.map(d => d.id)
            }).then((res) => {
                const element = document.createElement('a');
                element.setAttribute('href', encodeURI(res.data));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
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
            const response = await Restangular.one('projects').get({where: {key: projectTypeAgreement, group: group.id}});
            const agreements = response.items;
            return Prototyper.toAgreementModel(agreements[0]);
        }
        /* jshint ignore:end */

        function setStructureYear(structure, minMaxYear) {
            if (minMaxYear && minMaxYear.min) {
                structure.year.floor = parseInt(minMaxYear.min);
            } else {
                structure.year.floor = parseInt(new Date().getFullYear());
            }

            if (minMaxYear && minMaxYear.max) {
                structure.year.ceil = parseInt(minMaxYear.max);
            } else {
                structure.year.ceil = parseInt(new Date().getFullYear());
            }
        }

        function setMinMaxYears(structure, values) {

            switch (values.projectType) {
                case 'all':
                    setStructureYear(structure, structure.year.minMaxYears.find(v => v.key === 'all').values);
                    break;
                case 'project_industrial':
                    setStructureYear(structure, structure.year.minMaxYears.find(v => v.key === 'project_industrial').values);
                    break;
                case 'project_competitive':
                    setStructureYear(structure, structure.year.minMaxYears.find(v => v.key === 'project_competitive').values);
                    break;
                default:
                    break;
            }
        }

        function onChange(structure, values, key) {
            switch (key) {
                case 'projectType':
                    structure.title.visible = false;
                    structure.acronym.visible = false;
                    structure.pi.visible = false;
                    structure.year.visible = false;
                    structure.status.visible = false;
                    structure.funding.visible = false;
                    structure.action.visible = false;
                    structure.category.visible = false;
                    structure.payment.visible = false;

                    switch (values[key]) {
                        case 'all':
                            structure.title.visible = true;
                            structure.acronym.visible = true;
                            structure.pi.visible = true;
                            structure.year.visible = true;
                            setMinMaxYears(structure, values);
                            break;
                        case 'project_industrial':
                            structure.title.visible = true;
                            structure.acronym.visible = true;
                            structure.pi.visible = true;
                            structure.year.visible = true;
                            structure.category.visible = true;
                            structure.payment.visible = true;
                            setMinMaxYears(structure, values);
                            break;
                        case 'project_competitive':
                            structure.title.visible = true;
                            structure.acronym.visible = true;
                            structure.pi.visible = true;
                            structure.year.visible = true;
                            structure.status.visible = true;
                            structure.funding.visible = true;
                            structure.action.visible = true;
                            setMinMaxYears(structure, values);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
    }
})();
