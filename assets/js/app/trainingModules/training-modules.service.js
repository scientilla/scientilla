/* global angular */
(function () {
    angular.module("trainingModules").factory("trainingModuleService", controller);

    controller.$inject = [
        'ResearchEntitiesService',
        '$http',
        'context',
        'trainingModuleRequiredFields',
        'trainingModuleFieldsRules',
        'ValidateService'
    ];

    function controller(
        ResearchEntitiesService,
        $http,
        context,
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
            delete: ResearchEntitiesService.deleteDraft,
            get: ResearchEntitiesService.getTrainingModules,
            getDrafts: ResearchEntitiesService.getTrainingModuleDrafts,
            getSuggested: ResearchEntitiesService.getSuggestedTrainingModules,
            getDiscarded: ResearchEntitiesService.getDiscardedTrainingModules,
            editAffiliations: ResearchEntitiesService.editAffiliations,
            unverify: ResearchEntitiesService.unverify,
            discard: ResearchEntitiesService.discard,
            multipleDiscard: ResearchEntitiesService.multipleDiscard,
            multipleVerify: ResearchEntitiesService.multipleVerify,
            multipleDelete: ResearchEntitiesService.deleteDrafts,
            exportDownload,
            filterFields,
            validate,
            verify,
            isValid
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
            fields.forEach(key => {
                if (typeof trainingModule[key] === 'boolean') {
                    filteredtrainingModule[key] = trainingModule[key] ? trainingModule[key] : false;
                } else {
                    filteredtrainingModule[key] = trainingModule[key] ? trainingModule[key] : null;
                }
            });
            return filteredtrainingModule;
        }

        function validate(trainingModule, field = false) {
            const requiredFields = getRequiredFields(trainingModule);
            return ValidateService.validate(trainingModule, field, requiredFields, trainingModuleFieldsRules);
        }

        function getRequiredFields(trainingModule) {
            const requiredFields = _.cloneDeep(trainingModuleRequiredFields);
            if (!_.has(trainingModule, 'otherCourse') || !trainingModule.otherCourse) {
                requiredFields.push('institute');
                requiredFields.push('phdCourse');
            }
            return requiredFields;
        }

        /* jshint ignore:start */
        async function verify(researchEntity, researchItem) {
            const completeResearchItem = await ResearchEntitiesService.getTrainingModule(researchItem.id);
            await ResearchEntitiesService.verify('training-module', researchEntity, completeResearchItem);

            if (researchEntity.type === 'user') {
                await context.refreshSubResearchEntity();
            }
        }
        /* jshint ignore:end */

        function isValid(trainingModule) {
            return _.isEmpty(validate(trainingModule));
        }
    }
})();
