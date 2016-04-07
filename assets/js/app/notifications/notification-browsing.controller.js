(function () {
    angular
            .module('notifications')
            .controller('NotificationBrowsingController', NotificationBrowsingController);

    NotificationBrowsingController.$inject = [
        'AuthService',
        'ModalService',
        'Restangular',
        'researchEntityService'
    ];

    function NotificationBrowsingController(AuthService, ModalService, Restangular, researchEntityService) {

        var vm = this;
        vm.copyReference = copyReference;
        vm.verifyReference = verifyReference;
        vm.researchEntities = _.union([AuthService.user], AuthService.user.admininstratedGroups);

        vm.listRefreshGenerator = listRefreshGenerator;
        vm.getDataGenerator = getDataGenerator;

        var query = {};


        function getDataGenerator(researchEntity) {
            return function (q) {
                return getData(researchEntity, q);
            };
        }

        function listRefreshGenerator(researchEntity) {
            return function (documents) {
                listRefresh(researchEntity, documents);
            };
        }


        function copyReference(document, target) {

            var restType = target.getType() + 's';

            var researchEntity = Restangular
                    .one(restType, target.id);

            ModalService
                    .openScientillaDocumentForm(
                            Scientilla.reference.copyDocument(document, target),
                            researchEntity)
                    .then(function () {
                        reload(target);
                    });

        }

        function verifyReference(document, target) {
            //sTODO move to a service
            researchEntityService.verifyDocument(target, document.id)
                    .then(function () {
                        reload(target);
                    });
        }


        // private
        function reload(target) {
            getData(target, query).
                    then(function (documents) {
                        listRefresh(target, documents);
                    });
        }

        function getData(researchEntity, q) {
            query = q;
            return researchEntityService.getSuggestedDocuments(researchEntity, query);
        }

        function listRefresh(researchEntity, documents) {
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
        }
    }
})();
