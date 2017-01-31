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
        'config',
        'context'
    ];

    function scientillaDocumentController(ModalService, config, context) {
        var vm = this;
        vm.openDetails = openDetails;
        vm.hasMainGroupAffiliation = hasMainGroupAffiliation;
        vm.editTags = editTags;
        vm.arePrivateTagsShowable = arePrivateTagsShowable;

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

        function arePrivateTagsShowable() {
            return true;
        }

        function editTags() {
            ModalService.openScientillaTagForm(vm.document);
        }
    }


})();