(function () {
    angular
            .module('notifications')
            .controller('NotificationBrowsingController', NotificationBrowsingController);

    NotificationBrowsingController.$inject = [
        'AuthService',
        'ModalService',
        'researchEntityService'
    ];

    function NotificationBrowsingController(AuthService, ModalService, researchEntityService) {

        var vm = this;
        vm.copyReference = copyReference;
        vm.verifyReference = verifyReference;
        vm.researchEntities = _.union([AuthService.user], AuthService.user.admininstratedGroups);

        vm.listRefreshGenerator = listRefreshGenerator;
        vm.getDataGenerator = getDataGenerator;


        function getDataGenerator(researchEntity) {
            return function (query) {
                return researchEntityService.getSuggestedDocuments(researchEntity, query);
            };
        }

        function listRefreshGenerator(researchEntity) {

            return function (documents) {              
                researchEntity.documents = documents;
                _.forEach(researchEntity.documents, function (d) {
                    if (d)
                        _.defaults(d, Scientilla.reference);
                    _.forEach(d.privateCoauthors, function (c) {
                        _.defaults(c, Scientilla.user);
                    });
                    _.forEach(d.publicCoauthors, function (c) {
                        _.defaults(c, Scientilla.user);
                    });
                });
            };
        }


        function copyReference(document, target) {
            console.log(target);
            ModalService
                    .openScientillaDocumentForm(
                            Scientilla.reference.copyDocument(document, target),
                            target)
                    .then(function () {
                    });

        }

        function verifyReference(document, target) {
            //sTODO move to a service
            target.post('privateReferences', {id: document.id})
                    .then(function () {
                    });
        }
    }
})();
