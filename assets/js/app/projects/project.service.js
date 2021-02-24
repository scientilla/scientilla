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

    controller.$inject = ['Restangular', 'EventsService', 'ResearchEntitiesService', '$http'];

    function controller(Restangular, EventsService, ResearchEntitiesService, $http) {

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
            isValid,
            validate,
            generateGroup,
            exportDownload
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


        function isValid(project) {
            return true;
        }

        function validate(project, field = false) {
            return true;
        }

        function exportDownload(projects, format = 'csv') {
            const filename = 'Projects_Export.csv';
            $http.post('/api/v1/projects/export', {
                format: format,
                projectIds: projects.map(d => d.id)
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

        function filterFields(project) {
            if (!project.type)
                return {};
            const filteredProject = {};
            fields[project.type].forEach(key => filteredProject[key] = project[key] ? project[key] : null);
            return filteredProject;
        }
    }
})();