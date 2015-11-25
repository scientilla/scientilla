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
            return getSuggestedReferences().then(function () {

            });
        }

        function getSuggestedReferences() {
            //sTODO move to a service
            return user.getList('notifications')
                    .then(function (notifications) {
                        vm.notifications = notifications;
                        var userId = AuthService.user.id.toString();
                        vm.suggestedReferences = _.map(_.filter(notifications, {targetType: 'user', targetId: userId}), 'content.reference');
                        return vm.suggestedReferences;
                    });
        }

        function copyReference(reference) {
            //sTODO-urgent owner must be changed server-side
            //sTODO move to a service
            var newReference = Scientilla.reference.create(reference, user.id);
            user.post('references', newReference)
                    .then(function () {
                        _.remove(vm.suggestedReferences, reference);
                    });
        }
    }
})();
