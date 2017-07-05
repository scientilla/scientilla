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
        'DocumentLabels',
        'context'
    ];

    function scientillaDocument(ModalService, config, DocumentLabels, context) {
        var vm = this;
        vm.openDetails = openDetails;
        vm.hasMainGroupAffiliation = hasMainGroupAffiliation;
        vm.editTags = editTags;

        vm.$onInit = function () {
            vm.showPrivateTags = vm.showPrivateTags || false;
            vm.verifiedCount = getVerifiedCount();
            checkDuplicate();
        };

        function checkDuplicate() {
            function isSuggested(doc) {
                const researchEntity = context.getResearchEntity();
                const f = researchEntity.getType() === 'user' ? 'authors' : 'groups';
                const ids = doc[f].map(re => re.id);
                return !ids.includes(researchEntity.id);
            }

            if (!vm.document.duplicates || !vm.document.duplicates.length)
                return;
            let documentLabel;
            if (['e', 'd'].includes(vm.document.kind) || isSuggested(vm.document))
                documentLabel = DocumentLabels.ALREADY_VERIFIED;
            else
                documentLabel = DocumentLabels.DUPLICATE;
            vm.document.addLabel(documentLabel);

        }

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

        function getVerifiedCount() {
            return vm.document.authorships.filter(a => a.researchEntity)
                .concat(vm.document.groupAuthorships).length;
        }
    }


})();