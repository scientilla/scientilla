/* global angular */
(function () {
    angular.module("trainingModules").factory("trainingModuleService", controller);

    controller.$inject = [
        'ResearchEntitiesService',
        '$http',
        'context',
        'trainingModuleRequiredFields',
        'trainingModuleFieldsRules',
        'ValidateService',
        'DownloadService'
    ];

    function controller(
        ResearchEntitiesService,
        $http,
        context,
        trainingModuleRequiredFields,
        trainingModuleFieldsRules,
        ValidateService,
        DownloadService
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
            'wholeModule',
            'generalModuleTitle',
            'otherCourse',
            'hours',
            'lectures',
            'researchDomains',
            'location',
            'delivery',
            'type'
        ];

        return {
            edit: (researchEntity, draft) => ResearchEntitiesService.editDraft(researchEntity, draft, 'training_module'),
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
            isValid,
            getNextYear
        };

        function exportDownload(trainingModules, format = 'csv') {
            $http.post('/api/v1/training-modules/export', {
                format: format,
                trainingModuleIds: trainingModules.map(d => d.id)
            }, {responseType: 'arraybuffer'})
                .then((res) => {
                    DownloadService.download(res.data, 'training-modules', format);
                });
        }

        function filterFields(trainingModule) {
            const filteredTrainingModule = {};
            fields.forEach(key => {
                if (typeof trainingModule[key] === 'boolean') {
                    filteredTrainingModule[key] = trainingModule[key] ? trainingModule[key] : false;
                } else {
                    filteredTrainingModule[key] = trainingModule[key] ? trainingModule[key] : null;
                }
            });
            return filteredTrainingModule;
        }

        function validate(trainingModule, field = false) {
            const requiredFields = getRequiredFields(trainingModule);
            return ValidateService.validate(trainingModule, field, requiredFields, trainingModuleFieldsRules);
        }

        function getRequiredFields(trainingModule) {
            let requiredFields = _.cloneDeep(trainingModuleRequiredFields);
            if (_.has(trainingModule, 'wholeModule') && !trainingModule.wholeModule) {
                requiredFields.push('generalModuleTitle');
            } else {
                requiredFields.push('wholeModule');
            }

            if (
                trainingModule.type.key  === 'training_module_phd_lecture' &&
                (!_.has(trainingModule, 'otherCourse') || !trainingModule.otherCourse)
            ) {
                requiredFields.push('institute');
                requiredFields.push('phdCourse');
            }
            return requiredFields;
        }

        /* jshint ignore:start */
        async function verify(researchEntity, researchItem) {
            const completeResearchItem = await ResearchEntitiesService.getTrainingModule(researchItem.id);
            await ResearchEntitiesService.verify('training_module', researchEntity, completeResearchItem);

            if (researchEntity.type === 'user') {
                await context.refreshSubResearchEntity();
            }
        }
        /* jshint ignore:end */

        function isValid(trainingModule) {
            return _.isEmpty(validate(trainingModule));
        }

        function getNextYear(year) {
            const momentYear = moment(parseInt(year), 'YYYY');
            if (momentYear.isValid()) {
                return momentYear.add(1, 'y').format('YY');
            }
            return 'xx';
        }
    }
})();
