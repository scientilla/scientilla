(function () {

    angular.module("accomplishments").factory("GroupAccomplishmentsServiceFactory", GroupAccomplishmentsServiceFactory);

    GroupAccomplishmentsServiceFactory.$inject = [
        'AccomplishmentsServiceFactory',
        'Notification',
        'researchEntityService',
        'EventsService',
        'GroupsService'
    ];

    function GroupAccomplishmentsServiceFactory(
        AccomplishmentsServiceFactory,
        Notification,
        researchEntityService,
        EventsService,
        GroupsService
    ) {
        return {
            create: function (researchEntity) {
                var service = AccomplishmentsServiceFactory.create(researchEntity, GroupsService);

                return service;
            }
        };
    }
}());
