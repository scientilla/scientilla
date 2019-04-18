/* global angular */
(function () {
    angular.module("app").factory("AccomplishmentService", controller);

    controller.$inject = [
        'context',
        'ResearchEntitiesService',
        'ValidateService',
        'ResearchItemTypesService',
        'researchItemKinds',
        'accomplishmentFieldsRules',
        'accomplishmentOrigins',
        'accomplishmentRequiredFields'
    ];

    function controller(context,
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
            'affiliation',
            'issuer',
            'medium',
            'description',
            'type',
            'kind',
            'draftCreator',
            'editorInChief',
            'eventType',
            'place'
        ];

        return {
            edit: ResearchEntitiesService.editDraft,
            create: ResearchEntitiesService.createDraft,
            update: ResearchEntitiesService.updateDraft,
            delete: ResearchEntitiesService.deleteDraft,
            multipleDelete: ResearchEntitiesService.deleteDrafts,
            getDrafts: ResearchEntitiesService.getAccomplishmentDrafts,
            get: ResearchEntitiesService.getAccomplishments,
            verify,
            verifyAll: ResearchEntitiesService.verifyAll,
            unverify: ResearchEntitiesService.unverify,
            isValid,
            validate,
            filterFields
        };


        /* jshint ignore:start */
        async function verify(researchEntity, researchItem) {
            const researchItems = await ResearchEntitiesService.getAccomplishmentDrafts(researchEntity, {where: {id: researchItem.id}});
            await ResearchEntitiesService.verify('accomplishment', researchEntity, researchItems[0]);

            if (researchEntity.type === 'user') {
                await context.refreshSubResearchEntity();
            }
        }
        /* jshint ignore:end */

        function isValid(accomplishment) {
            return _.isEmpty(validate(accomplishment));
        }

        function filterFields(accomplishment) {
            const filteredAccomplishment = {};
            fields.forEach(key => filteredAccomplishment[key] = accomplishment[key]);
            return filteredAccomplishment;
        }

        function validate(accomplishment, field = false) {
            const requiredFields = accomplishmentRequiredFields[accomplishment.type.key];
            return ValidateService.validate(accomplishment, field, requiredFields, accomplishmentFieldsRules);
        }
    }
})();