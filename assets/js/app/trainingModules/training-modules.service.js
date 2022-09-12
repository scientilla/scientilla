/* global angular */
(function () {
    angular.module("trainingModules").factory("trainingModuleService", controller);

    controller.$inject = [
        'ResearchEntitiesService',
        '$http',
        'trainingModuleRequiredFields',
        'trainingModuleFieldsRules',
        'ValidateService'
    ];

    function controller(
        ResearchEntitiesService,
        $http,
        trainingModuleRequiredFields,
        trainingModuleFieldsRules,
        ValidateService
    ) {
        const fields = [
            'id',
            'authorsStr',
            'referent',
            'institute',
            'phdCourse',
            'title',
            'year',
            'description',
            'otherCourse',
            'hours',
            'lectures',
            'researchDomains',
            'location',
            'delivery',
            'type'
        ];

        return {
            edit: (researchEntity, draft) => ResearchEntitiesService.editDraft(researchEntity, draft, 'training-module'),
            create: ResearchEntitiesService.createDraft,
            update: ResearchEntitiesService.updateDraft,
            get: ResearchEntitiesService.getTrainingModules,
            getDrafts: ResearchEntitiesService.getTrainingModuleDrafts,
            getSuggested: ResearchEntitiesService.getSuggestedTrainingModules,
            getDiscarded: ResearchEntitiesService.getDiscardedTrainingModules,
            exportDownload,
            filterFields,
            validate,
            verify
        };

        function exportDownload(patents, format = 'csv') {
            const filename = 'Phd_Trainings_Export.csv';
            $http.post('/api/v1/training-modules/export', {
                format: format,
                patentIds: patents.map(d => d.id)
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

        function filterFields(trainingModule) {
            const filteredtrainingModule = {};
            fields.forEach(key => filteredtrainingModule[key] = trainingModule[key] ? trainingModule[key] : null);
            return filteredtrainingModule;
        }

        function validate(trainingModule, field = false) {
            return ValidateService.validate(trainingModule, field, trainingModuleRequiredFields, trainingModuleFieldsRules);
        }

        /* jshint ignore:start */
        async function verify(researchEntity, researchItem) {
            const completeResearchItem = await ResearchEntitiesService.getTrainingModule(researchItem.id);
            await ResearchEntitiesService.verify('trainingModule', researchEntity, completeResearchItem);

            if (researchEntity.type === 'user') {
                await context.refreshSubResearchEntity();
            }
        }
        /* jshint ignore:end */
    }
})();
