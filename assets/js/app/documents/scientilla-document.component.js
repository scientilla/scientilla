(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDocument', {
            templateUrl: 'partials/scientillaDocument.html',
            controller: scientillaDocument,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                showPrivateTags: "<?"
            }
        });

    scientillaDocument.$inject = [
        'ModalService',
        'config',
        'ClientTags'
    ];

    function scientillaDocument(ModalService, config, ClientTags) {
        var vm = this;
        vm.openDetails = openDetails;
        vm.hasMainGroupAffiliation = hasMainGroupAffiliation;
        vm.editTags = editTags;
        vm.isDisabled = isDisabled;

        vm.$onInit = function () {
            vm.showPrivateTags = vm.showPrivateTags || false;
        };

        function openDetails() {
            ModalService
                .openScientillaDocumentDetails(vm.document);
        }

        function hasMainGroupAffiliation() {
            return _.some(vm.document.affiliations, function (a) {
                return a.institute === config.mainInstitute.id;
            });
        }

        function editTags() {
            ModalService.openScientillaTagForm(vm.document);
        }

        function isDisabled(){
            return vm.document.tags.indexOf(ClientTags.DUPLICATE) >= 0;
        }
    }


})();