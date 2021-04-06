(function () {
    angular
        .module('agreements')
        .controller('AgreementBrowsingController', AgreementBrowsingController);

    AgreementBrowsingController.$inject = [
        'ProjectService',
        'Notification',
        'AuthService',
        'EventsService'
    ];

    function AgreementBrowsingController(
        ProjectService,
        Notification,
        AuthService,
        EventsService
    ) {
        const vm = this;

        vm.user = AuthService.user;
        vm.deleteAgreement = deleteAgreement;
        vm.onFilter = onFilter;

        vm.agreementGroups = [];

        let query = {};

        /* jshint ignore:start */
        async function onFilter(q) {
            query = q;

            vm.agreementGroups = await ProjectService.getGroups(query);
        }
        /* jshint ignore:end */


        function deleteAgreement(agreement) {
            agreement.remove()
                .then(function () {
                    Notification.success("Agreement deleted");
                    EventsService.publish(EventsService.PROJECT_GROUP_DELETED, agreement);
                    refreshList();
                })
                .catch(function () {
                    Notification.warning("Failed to delete Agreement");
                });
        }

        function refreshList() {
            return onFilter(query);
        }
    }
})();