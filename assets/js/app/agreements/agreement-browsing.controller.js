(function () {
    angular
        .module('agreements')
        .controller('AgreementBrowsingController', AgreementBrowsingController);

    AgreementBrowsingController.$inject = [
        'AgreementService',
        'Notification',
        'ModalService',
        'AuthService'
    ];

    function AgreementBrowsingController(AgreementService, Notification, ModalService, AuthService) {
        const vm = this;

        vm.user = AuthService.user;
        vm.deleteAgreement = deleteAgreement;
        vm.onFilter = onFilter;

        vm.agreementGroups = [];

        let query = {};

        /* jshint ignore:start */
        async function onFilter(q) {
            query = q;

            vm.agreementGroups = AgreementService.getGroups(query);
        }
        /* jshint ignore:end */


        function deleteAgreement(agreement) {
            agreement.remove()
                .then(function () {
                    Notification.success("Agreement deleted");
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