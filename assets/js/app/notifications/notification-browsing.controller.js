/* global Scientilla */

(function () {
    angular
            .module('notifications')
            .controller('NotificationBrowsingController', NotificationBrowsingController);

    NotificationBrowsingController.$inject = [
        'AuthService',
        'ModalService',
        'Restangular',
        'researchEntityService',
        'Notification'
    ];

    function NotificationBrowsingController(AuthService, ModalService, Restangular, researchEntityService, Notification) {

        var vm = this;
        vm.copyDocument = copyDocument;
        vm.verifyDocument = verifyDocument;
        vm.discardDocument = discardDocument;
        vm.getVerifyAllDocuments = getVerifyAllDocuments;
        vm.getDiscardAllDocuments = getDiscardAllDocuments;

        vm.targets = _.map(_.union([AuthService.user], AuthService.user.admininstratedGroups),
                function (reserarchEntity) {
                    return {
                        researchEntity: reserarchEntity,
                        documents: [],
                        query: {}
                    };
                });

        vm.listRefreshGenerator = listRefreshGenerator;
        vm.getDataGenerator = getDataGenerator;

        vm.searchForm = {
            rejected: {
                inputType: 'checkbox',
                label: 'Include discarded documents',
                defaultValue: false,
                matchColumn: 'discarded',
                matchRule: 'is null'
            }
        };

        function getDataGenerator(target) {
            return function (query) {
                target.query = query;
                return getData(target);
            };
        }

        function listRefreshGenerator(target) {
            return function (documents) {
                target.documents = documents;
                listRefresh(target);
            };
        }


        function copyDocument(document, target) {

            var restType = target.researchEntity.getType() + 's';

            var restResearchEntity = Restangular
                    .one(restType, target.researchEntity.id);

            ModalService
                    .openScientillaDocumentForm(
                            Scientilla.reference.copyDocument(document, target.researchEntity),
                            restResearchEntity)
                    .then(function () {
                        reload(target);
                    });

        }
        
        function getVerifyAllDocuments(researchEntity){
            return function(documents){
                
            };
        }

        function verifyDocument(document, target) {
            //sTODO move to a service
            researchEntityService
                    .verifyDocument(target.researchEntity, document.id)
                    .then(function () {
                        Notification.success('Document verified');
                        reload(target);
                    })
                    .catch(function () {
                        Notification.warning('Failed to verify document');
                    });
        }
        
        function getDiscardAllDocuments(researchEntity){
            return function(documents){
                
            };
        }

        function discardDocument(document, target) {
            //sTODO move to a service
            researchEntityService
                    .discardDocument(target.researchEntity, document.id)
                    .then(function () {
                        Notification.success('Document discarded');
                        reload(target);
                    })
                    .catch(function () {
                        Notification.warning('Failed to discard document');
                    });
        }


        // private
        function reload(target) {
            getData(target).
                    then(function (documents) {
                        target.documents = documents;
                        listRefresh(target);
                    });
        }

        function getData(target) {
            return researchEntityService.getSuggestedDocuments(target.researchEntity, target.query);
        }

        function listRefresh(target) {
            _.forEach(target.documents, function (d) {
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
