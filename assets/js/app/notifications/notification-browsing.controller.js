(function () {
    angular
            .module('notifications')
            .controller('NotificationBrowsingController', NotificationBrowsingController);

    NotificationBrowsingController.$inject = [
        'UsersService',
        'Restangular',
        'user'
    ];

    function NotificationBrowsingController(UsersService, Restangular, user) {
        var vm = this;
        vm.copyReference = copyReference;

        activate();

        function activate() {
            return getSuggestedReferences().then(function () {

            });
        }

        function getSuggestedReferences() {
            //sTODO move to a service
            return user.getList('suggested-references')
                    .then(function (suggestedReferences) {
                        vm.suggestedReferences = suggestedReferences;
                        return vm.suggestedReferences;
                    });
        }

        function copyReference(reference) {
            //sTODO-urgent owner must be changed server-side
            //sTODO move to a service
            var newReference = Scientilla.reference.create(reference, user.id);
            user.post('references', newReference)
                    .then(function() {
                        _.remove(vm.suggestedReferences, reference);
                    })
        }
    }
})();
