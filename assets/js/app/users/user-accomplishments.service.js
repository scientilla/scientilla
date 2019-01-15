(function () {

    angular.module("accomplishments").factory("UserAccomplishmentsServiceFactory", UserAccomplishmentsServiceFactory);

    UserAccomplishmentsServiceFactory.$inject = [
        'AccomplishmentsServiceFactory',
        'Notification',
        'researchEntityService',
        'ModalService',
        'EventsService',
        'UsersService',
    ];

    function UserAccomplishmentsServiceFactory(
        AccomplishmentsServiceFactory,
        Notification,
        researchEntityService,
        ModalService,
        EventsService,
        UsersService
    ) {
        return {
            create: function (researchEntity) {
                var service = AccomplishmentsServiceFactory.create(researchEntity, UsersService);

                return service;
            }
        };
    }
}());
