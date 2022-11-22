/* global angular */
(function () {
    angular.module("app").factory("AccomplishmentService", controller);

    controller.$inject = [
        '$http',
        'context',
        'ResearchEntitiesService',
        'ValidateService',
        'ResearchItemTypesService',
        'researchItemKinds',
        'accomplishmentFieldsRules',
        'accomplishmentOrigins',
        'accomplishmentRequiredFields'
    ];

    function controller($http,
                        context,
                        ResearchEntitiesService,
                        ValidateService,
                        ResearchItemTypesService,
                        researchItemKinds,
                        accomplishmentFieldsRules,
                        accomplishmentOrigins,
                        accomplishmentRequiredFields) {

        const fields = [
            'id',
            'title',
            'authorsStr',
            'year',
            'yearTo',
            'issuer',
            'source',
            'description',
            'type',
            'kind',
            'draftCreator',
            'editorshipRole',
            'eventType',
            'place'
        ];

        return {
            edit: (researchEntity, draft) => ResearchEntitiesService.editDraft(researchEntity, draft, 'accomplishment'),
            create: ResearchEntitiesService.createDraft,
            update: ResearchEntitiesService.updateDraft,
            delete: ResearchEntitiesService.deleteDraft,
            editAffiliations: ResearchEntitiesService.editAffiliations,
            multipleDelete: ResearchEntitiesService.deleteDrafts,
            getDrafts: ResearchEntitiesService.getAccomplishmentDrafts,
            get: ResearchEntitiesService.getAccomplishments,
            getDiscarded: ResearchEntitiesService.getDiscardedAccomplishments,
            copy: ResearchEntitiesService.copy,
            multipleCopy: ResearchEntitiesService.multipleCopy,
            verify,
            multipleVerify: ResearchEntitiesService.multipleVerify,
            unverify: ResearchEntitiesService.unverify,
            getSuggested: ResearchEntitiesService.getSuggestedAccomplishments,
            discard: ResearchEntitiesService.discard,
            multipleDiscard: ResearchEntitiesService.multipleDiscard,
            isValid,
            validate,
            filterFields,
            exportDownload
        };


        /* jshint ignore:start */
        async function verify(researchEntity, researchItem) {
            const completeResearchItem = await ResearchEntitiesService.getAccomplishment(researchItem.id);
            await ResearchEntitiesService.verify('accomplishment', researchEntity, completeResearchItem);

            if (researchEntity.type === 'user') {
                await context.refreshSubResearchEntity();
            }
        }

        /* jshint ignore:end */

        function exportDownload(accomplishments, format) {
            const filename = format === 'csv' ? 'Accomplishments_Export.csv' : 'Accomplishments_Export.bib';
            $http.post('/api/v1/accomplishments/export', {
                format: format,
                accomplishmentIds: accomplishments.map(d => d.id)
            }).then((res) => {
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/csv;charset=UTF-8,' + encodeURIComponent(res.data));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            });
        }

        function isValid(accomplishment) {
            return _.isEmpty(validate(accomplishment));
        }

        function filterFields(accomplishment) {
            const filteredAccomplishment = {};
            fields.forEach(key => filteredAccomplishment[key] = accomplishment[key] ? accomplishment[key] : null);
            return filteredAccomplishment;
        }

        function validate(accomplishment, field = false) {
            const requiredFields = accomplishmentRequiredFields[accomplishment.type.key];
            return ValidateService.validate(accomplishment, field, requiredFields, accomplishmentFieldsRules);
        }
    }
})();
