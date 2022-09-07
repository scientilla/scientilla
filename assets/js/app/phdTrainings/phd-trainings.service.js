/* global angular */
(function () {
    angular.module("phdTrainings").factory("PhdTrainingService", controller);

    controller.$inject = [
        'ResearchEntitiesService',
        '$http',
        'phdTrainingRequiredFields',
        'phdTrainingFieldsRules',
        'ValidateService'
    ];

    function controller(
        ResearchEntitiesService,
        $http,
        phdTrainingRequiredFields,
        phdTrainingFieldsRules,
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
            edit: (researchEntity, draft) => ResearchEntitiesService.editDraft(researchEntity, draft, 'phd-training'),
            create: ResearchEntitiesService.createDraft,
            update: ResearchEntitiesService.updateDraft,
            get: ResearchEntitiesService.getPhdTrainings,
            getDrafts: ResearchEntitiesService.getPhdTrainingDrafts,
            getSuggested: ResearchEntitiesService.getSuggestedPhdTrainings,
            getDiscarded: ResearchEntitiesService.getDiscardedPhdTrainings,
            exportDownload,
            filterFields,
            validate,
            verify
        };

        function exportDownload(patents, format = 'csv') {
            const filename = 'Phd_Trainings_Export.csv';
            $http.post('/api/v1/phd-trainings/export', {
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

        function filterFields(phdTraining) {
            const filteredPhdTraining = {};
            fields.forEach(key => filteredPhdTraining[key] = phdTraining[key] ? phdTraining[key] : null);
            return filteredPhdTraining;
        }

        function validate(phdTraining, field = false) {
            return ValidateService.validate(phdTraining, field, phdTrainingRequiredFields, phdTrainingFieldsRules);
        }

        /* jshint ignore:start */
        async function verify(researchEntity, researchItem) {
            const completeResearchItem = await ResearchEntitiesService.getPhdTraining(researchItem.id);
            await ResearchEntitiesService.verify('trainingModule', researchEntity, completeResearchItem);

            if (researchEntity.type === 'user') {
                await context.refreshSubResearchEntity();
            }
        }
        /* jshint ignore:end */
    }
})();
