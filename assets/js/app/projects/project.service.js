/* global angular */
(function () {
    angular.module("app").factory("ProjectService", controller);

    const fields = {
        project_agreement: [
            'piStr',
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
        'ModalService'
    ];

    function controller(
        Restangular,
        EventsService,
        ResearchEntitiesService,
        $http,
        ValidateService,
        ModalService
    ) {

        return {
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
                ids: items.map(d => d.id)
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
    }
})();