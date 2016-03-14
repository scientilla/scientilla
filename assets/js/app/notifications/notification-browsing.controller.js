(function () {
    angular
            .module('notifications')
            .controller('NotificationBrowsingController', NotificationBrowsingController);

    NotificationBrowsingController.$inject = [
        'AuthService',
        'Restangular',
        'user',
        'ModalService'
    ];

    function NotificationBrowsingController(AuthService, Restangular, user, ModalService) {
        var vm = this;
        vm.copyReference = copyReference;
        vm.verifyReference = verifyReference;
        vm.notificationTargets = _.union([AuthService.user], AuthService.user.admininstratedGroups);

        activate();

        function activate() {
            return getNotifications().then(function () {

            });
        }

        function getNotifications() {
            //sTODO move to a service
            return user.getList('notifications')
                    .then(function (notifications) {
                        vm.notifications = notifications;
                        _.forEach(vm.notifications, function (n) {
                            if (n.content.reference)
                                _.defaults(n.content.reference, Scientilla.reference);
                            _.forEach(n.content.reference.privateCoauthors, function (c) {
                                _.defaults(c, Scientilla.user);
                            });
                            _.forEach(n.content.reference.publicCoauthors, function (c) {
                                _.defaults(c, Scientilla.user);
                            });
                        });
                    });
        }
        
        function copyReference(notification, target) {
            ModalService
                    .openScientillaDocumentForm(
                    Scientilla.reference.copyDocument(notification.content.reference,target),
                    target)
                    .then(function (document) {
                        if(document)
                            _.remove(vm.notifications, notification);
                    });

        }

        function verifyReference(notification, target) {

            var reference = notification.content.reference;
            //sTODO move to a service
            target.post('privateReferences', {id: reference.id})
                    .then(function () {
                        _.remove(vm.notifications, notification);
                    });
        }
    }
})();
