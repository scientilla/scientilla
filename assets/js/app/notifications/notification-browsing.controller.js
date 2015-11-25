(function () {
    angular
            .module('notifications')
            .controller('NotificationBrowsingController', NotificationBrowsingController);

    NotificationBrowsingController.$inject = [
        'AuthService',
        'Restangular',
        'user'
    ];

    function NotificationBrowsingController(AuthService, Restangular, user) {
        var vm = this;
        vm.copyReference = copyReference;
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
                    });
        }

        function copyReference(notification, target) {
            //sTODO-urgent owner must be changed server-side
            //sTODO move to a service
            var reference = notification.content.reference;
            var newReference = Scientilla.reference.create(reference, target);
            target.post('references', newReference)
                    .then(function () {
                        _.remove(vm.notifications, notification);
                    });
        }
    }
})();
