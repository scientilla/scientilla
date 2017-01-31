(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDocument', {
            templateUrl: 'partials/scientillaDocument.html',
            controller: scientillaDocument,
            controllerAs: 'vm',
            bindings: {
                document: "<"
            }
        });

    scientillaDocument.$inject = [
        'ModalService',
        'config'
    ];

    function scientillaDocument(ModalService, config) {
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