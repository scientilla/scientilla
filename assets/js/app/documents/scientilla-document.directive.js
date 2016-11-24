(function () {
    'use strict';

    angular.module('documents')
        .directive('scientillaDocument', scientillaDocument);

    function scientillaDocument() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDocument.html',
            controller: scientillaDocumentController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                document: "="
            }
        };
    }

    scientillaDocumentController.$inject = [
        'ModalService',
        'config'
    ];

    function scientillaDocumentController(ModalService, config) {
        var vm = this;
        vm.openDetails = openDetails;
        vm.hasMainGroupAffiliation = hasMainGroupAffiliation;

        activate();

        function activate() {

        }

        function openDetails() {
            ModalService
                .openScientillaDocumentDetails(vm.document);
        }

        function hasMainGroupAffiliation() {
            return _.some(vm.document.affiliations, function (a) {
                return a.institute === config.mainInstitute.id
            });
        }
    }


})();