/* global Scientilla */

(function () {
    'use strict';

    angular.module('references')
            .directive('scientillaExternalDocuments', scientillaExternalDocuments);

    function scientillaExternalDocuments() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaExternalDocuments.html',
            controller: scientillaExternalDocumentsController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                researchEntity: "="
            }
        };
    }

    scientillaExternalDocumentsController.$inject = [
        'Notification',
        '$rootScope',
        'researchEntityService',
        '$q'
    ];

    function scientillaExternalDocumentsController(Notification, $rootScope, researchEntityService, $q) {
        var vm = this;
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;
        vm.STATUS_READY = 2;
        vm.STATUS_ERROR = 3;
        vm.copyReference = copyReference;
        vm.connectorChanged = connectorChanged;
        vm.selectedConnectorName = undefined;
        vm.reset = reset;
        vm.getData = getExternalReferences;
        vm.onFilter = refreshExternalDocuments;

        activate();

        function activate() {
            vm.connectors = vm.researchEntity.getExternalConnectors();
            var values = _.concat({value: '?', label: 'Select'}, vm.connectors.map(function (c) {
                return {value: c.name, label: c.name};
            }));
            vm.searchForm = {
                connector: {
                    inputType: 'select',
                    label: 'Connector',
                    values: values,
                    matchColumn: 'connector'
                }
            };
            reset();
        }

        function reset() {
            vm.status = vm.STATUS_WAITING;
            vm.documents = [];
        }

        function connectorChanged(connector) {
            vm.status = vm.STATUS_LOADING;
            return getExternalReferences(vm.researchEntity, connector).then(function () {

            });
        }

        function getExternalReferences(q) {
            var connector = q.where.connector;
            if (!connector)
                return $q.resolve([]);

            return researchEntityService.getExternalDrafts(vm.researchEntity, q)
                    .catch(function (err) {
                        Notification.error("External reference error");
                        vm.status = vm.STATUS_ERROR;
                    });
        }

        function refreshExternalDocuments(documents) {
            vm.documents = documents;
            vm.status = vm.STATUS_READY;
        }

        function copyReference(externalDocument, researchEntity) {
            //sTODO move to a service
            var draftData = Scientilla.reference.create(externalDocument);
            researchEntity
                    .post('drafts', draftData)
                    .then(function () {
                        Notification.success("External Document copied");

                        $rootScope.$broadcast("draft.created", {});
                        _.remove(vm.documents, externalDocument);
                    })
                    .catch(function () {
                        Notification.warning("Failed to copy External Document");
                    });
        }
    }
})();
