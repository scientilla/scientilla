(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDocument', {
            templateUrl: 'partials/scientillaDocument.html',
            controller: scientillaDocument,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                showPrivateTags: "<?",
                checkDuplicates: '<?'
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
        vm.isSynchronized = isSynchronized;

        const researchEntity = context.getResearchEntity();
        if (_.isNil(vm.checkDuplicates))
            vm.checkDuplicates = true;

        vm.$onInit = function () {
            vm.showPrivateTags = vm.showPrivateTags || false;
            vm.verifiedCount = getVerifiedCount();
            if (vm.checkDuplicates)
                checkDuplicate();
        };

        function checkDuplicate() {
            function isSuggested(doc) {
                const f = researchEntity.getType() === 'user' ? 'authors' : 'groups';
                return !doc[f].some(re => re.id === researchEntity.id);
            }

            if (!vm.document.duplicates || !vm.document.duplicates.length)
                return;
            let documentLabel;
            //verified and duplicated
            if (vm.document.kind === 'v' && !isSuggested(vm.document) && vm.document.duplicates.some(d => d.duplicateKind === 'v'))
                documentLabel = DocumentLabels.DUPLICATE;
            //verified and duplicates in drafts (no real duplicates)
            else if (vm.document.kind === 'v' && !isSuggested(vm.document) && vm.document.duplicates.every(d => d.duplicateKind === 'd'))
                ;
            //draft and duplicated
            else if (vm.document.kind === 'd' && vm.document.duplicates.every(d => d.duplicateKind === 'd'))
                documentLabel = DocumentLabels.DUPLICATE;
            //draft and already verified
            else if (vm.document.kind === 'd' && vm.document.duplicates.some(d => d.duplicateKind === 'v'))
                documentLabel = DocumentLabels.ALREADY_VERIFIED;
            //external and already verified
            else if (vm.document.kind === 'e' && vm.document.duplicates.some(d => d.duplicateKind === 'v'))
                documentLabel = DocumentLabels.ALREADY_VERIFIED;
            //external and already in drafts
            else if (vm.document.kind === 'e' && vm.document.duplicates.every(d => d.duplicateKind === 'd'))
                documentLabel = DocumentLabels.ALREADY_IN_DRAFTS;
            //suggested and already verified
            else if (vm.document.kind === 'v' && isSuggested(vm.document) && vm.document.duplicates.some(d => d.duplicateKind === 'v'))
                documentLabel = DocumentLabels.ALREADY_VERIFIED;
            //suggested and already in drafts
            else if (vm.document.kind === 'v' && isSuggested(vm.document) && vm.document.duplicates.every(d => d.duplicateKind === 'd'))
                documentLabel = DocumentLabels.ALREADY_IN_DRAFTS;
            if (documentLabel)
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

        function isSynchronized() {
            if (vm.document.kind === 'd')
                return vm.document.synchronized && vm.document.origin === 'scopus';
            else if (vm.document.kind === 'v') {
                const authorships = researchEntity.getType() === 'user' ? vm.document.authorships : vm.document.groupAuthorships;
                return !!authorships.find(a => a.researchEntity === researchEntity.id && a.synchronize);
            }
            return false;
        }
    }


})();