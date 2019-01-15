(function () {
    "use strict";

    angular.module("accomplishments")
        .factory("AccomplishmentsServiceFactory", AccomplishmentsServiceFactory);

    AccomplishmentsServiceFactory.$inject = [
        'researchEntityService',
        'EventsService'
        //'AccomplishmentKinds'
    ];

    function AccomplishmentsServiceFactory(researchEntityService, EventsService/*AccomplishmentKinds*/) {
        return {
            create: function (researchEntity) {
                var service = {};

                service.createDraft = createDraft;

                function createDraft(data) {
                    console.log(researchEntityService);

                    return researchEntityService
                        .accomplishment
                        .createDraft(researchEntity, data)
                        .then(function (draft) {
                            EventsService.publish(EventsService.ACCOMPLISHMENT_DRAFT_CREATED, draft);
                            return draft;
                        });
                }

                return service;
            }
        };
    }
}());
