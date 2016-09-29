(function () {

    angular.module("components").factory("researchEntityService", ResearchEntityServiceFactory);



    ResearchEntityServiceFactory.$inject = ['Restangular'];

    function ResearchEntityServiceFactory(Restangular) {
        var service = {};

        service.getDocuments = getDocuments;
        service.getDrafts = getDrafts;
        service.getSuggestedDocuments = getSuggestedDocuments;
        service.verifyDocument = verifyDocument;
        service.discardDocument = discardDocument;
        service.verifyDraft = verifyDraft;
        service.unverify = unverify;
        service.verifyDocuments = verifyDocuments;
        service.discardDocuments = discardDocuments;
        service.verifyDrafts = verifyDrafts;
        service.copyDocument = copyDocument;
        service.copyDocuments = copyDocuments;
        service.getExternalDocuments = getExternalDocuments;
        service.deleteDraft = deleteDraft;
        service.deleteDrafts = deleteDrafts;

        function getDocuments(researchEntity, query) {

            var populate = {populate: ['privateCoauthors']};

            var q = _.merge({}, query, populate);

            return researchEntity.getList('privateReferences', q);
        }

        function getDrafts(researchEntity, query) {
            if (!query)
                query = {};

            return researchEntity.getList('drafts', query);
        }

        function getExternalDocuments(researchEntity, query) {
            if (!query)
                query = {};

            return researchEntity.getList('external-documents', query);
        }


        function getSuggestedDocuments(researchEntity, query) {
            return researchEntity
                    .getList('suggested-documents', query);
        }

        function verifyDocument(researchEntity, id) {
            return researchEntity
                    .post('privateReferences', {id: id});
        }

        function verifyDraft(researchEntity, reference) {
            return researchEntity.one('drafts', reference.id)
                    .customPUT({}, 'verified');
        }

        function unverify(researchEntity, reference) {
            return researchEntity.one('references', reference.id)
                    .customPUT({}, 'unverified');
        }

        function discardDocument(researchEntity, documentId) {
            return researchEntity
                    .post('discarded-document', {documentId: documentId});
        }

        function verifyDocuments(researchEntity, documentIds) {
            return researchEntity
                    .customPUT({documentIds: documentIds}, 'verify-documents');
        }

        function discardDocuments(researchEntity, documentIds) {
            return researchEntity
                    .customPOST({documentIds: documentIds}, 'discarded-documents');
        }

        function copyDocuments(researchEntity, documents) {
            documents = documents.map(function (d) {
                return d.plain();
            });
            return researchEntity
                    .customPOST({documents: documents}, 'copy-drafts');
        }

        function copyDocument(researchEntity, document) {
            return researchEntity.all('drafts').post(document);
        }

        function verifyDrafts(researchEntity, draftIds) {
            return researchEntity
                    .all('drafts')
                    .customPUT({draftIds: draftIds}, 'verify-drafts');
        }

        function deleteDraft(researchEntity, draftId) {
            return researchEntity
                    .one('drafts', draftId)
                    .remove();
        }

        function deleteDrafts(researchEntity, draftIds) {
            return Restangular
                    .all('references')
                    .customDELETE('delete', {}, {}, {draftIds: draftIds});
        }

        return service;
    }
}());
