(function () {

    angular.module("components").factory("researchEntityService", ResearchEntityServiceFactory);


    ResearchEntityServiceFactory.$inject = [
        'Restangular',
        'DocumentLabels',
        'DocumentKinds'
    ];

    function ResearchEntityServiceFactory(Restangular, DocumentLabels, DocumentKinds) {
        var service = {};

        service.getDocument = getDocument;
        service.getDocuments = getDocuments;
        service.getDraft = getDraft;
        service.getDrafts = getDrafts;
        service.getDoc = getDoc;
        service.getSuggestedDocuments = getSuggestedDocuments;
        service.getDiscardedDocuments = getDiscardedDocuments;
        service.verifyDocument = verifyDocument;
        service.discardDocument = discardDocument;
        service.verifyDraftAsGroup = verifyDraftAsGroup;
        service.verifyDraftAsUser = verifyDraftAsUser;
        service.unverify = unverify;
        service.verifyDocuments = verifyDocuments;
        service.discardDocuments = discardDocuments;
        service.verifyDrafts = verifyDrafts;
        service.copyDocument = copyDocument;
        service.copyDocuments = copyDocuments;
        service.createDraft = createDraft;
        service.getExternalDocuments = getExternalDocuments;
        service.deleteDraft = deleteDraft;
        service.deleteDrafts = deleteDrafts;
        service.setPrivateTags = setPrivateTags;
        service.searchExternalDocument = searchExternalDocument;
        service.removeDocument = removeDocument;
        service.documentsNotDuplicate = documentsNotDuplicate;
        service.setAuthorshipPrivacy = setAuthorshipPrivacy;
        service.setAuthorshipFavorite = setAuthorshipFavorite;
        service.removeVerify = removeVerify;

        var documentPopulates = [
            'source',
            'authors',
            'authorships',
            'groupAuthorships',
            'affiliations',
            'citations',
            'sourceMetrics',
            'userTags',
            'tagLabels',
            'groupTags',
            'groupTagLabels',
            'institutes',
            'duplicates',
            'groups'
        ];

        function getDocuments(researchEntity, query) {
            var populate = {populate: documentPopulates};

            var q = _.merge({}, query, populate);

            return researchEntity.getList('documents', q);
        }

        function getDrafts(researchEntity, query) {
            var populate = {populate: documentPopulates};

            var q = _.defaultsDeep({}, query, populate);

            return researchEntity.getList('drafts', q);
        }

        function getExternalDocuments(researchEntity, query) {
            const populate = {populate: documentPopulates};
            const q = _.merge({
                limit: query.limit,
                skip: query.skip,
                where: query.where
            }, populate);

            return researchEntity.getList('externalDocuments', q);
        }


        function getSuggestedDocuments(researchEntity, query) {
            var populate = {populate: documentPopulates};

            var q = _.defaultsDeep({}, query, populate);

            return researchEntity.getList('suggestedDocuments', q);
        }

        function getDiscardedDocuments(researchEntity, query) {
            var populate = {populate: documentPopulates};

            var q = _.merge({}, query, populate);

            return researchEntity
                .getList('discardedDocuments', q)
                .then(list =>
                    _.forEach(list, d =>
                        d.addLabel(DocumentLabels.DISCARDED))
                );
        }

        function verifyDocument(researchEntity, id, verificationData) {
            const verificationFields = ['position', 'affiliations', 'corresponding', 'synchronize'];
            verificationData = _.pick(verificationData, verificationFields);
            verificationData.id = id;
            return researchEntity
                .post('documents', verificationData);
        }

        function verifyDraftAsGroup(researchEntity, draftId) {
            return researchEntity.one('drafts', draftId)
                .customPUT({}, 'verified');
        }

        function verifyDraftAsUser(researchEntity, draftId, verificationData) {
            const verificationFields = ['position', 'affiliations', 'corresponding', 'synchronize'];
            verificationData = _.pick(verificationData, verificationFields);
            return researchEntity.one('drafts', draftId)
                .customPUT(verificationData, 'verified');
        }

        function setAuthorshipPrivacy(researchEntity, authorship) {
            return researchEntity.one('documents', authorship.document)
                .customPUT({privacy: authorship.public}, 'privacy');
        }

        function setAuthorshipFavorite(researchEntity, authorship) {
            return researchEntity.one('documents', authorship.document)
                .customPUT({favorite: authorship.favorite}, 'favorite');
        }

        function unverify(researchEntity, document) {
            return researchEntity.one('documents', document.id)
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

        function createDraft(researchEntity, draftData) {
            return researchEntity.all('drafts').post(draftData);
        }

        function copyDocument(researchEntity, document) {
            return researchEntity.customPOST({documentId: document.id}, 'copy-document');
        }

        function copyDocuments(researchEntity, documents) {
            const documentIds = documents.map(d => d.id);
            return researchEntity.customPOST({documentIds: documentIds}, 'copy-documents');
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
            return researchEntity
                .all('drafts')
                .customPUT({draftIds: draftIds}, 'delete');
        }

        function setPrivateTags(researchEntity, document, tags) {
            return researchEntity.one('documents', document.id)
                .customPUT({tags: tags}, 'tags');
        }

        function searchExternalDocument(origin, searchKey, searchValue) {
            return Restangular.all('externals')
                .customGET('', {origin, searchKey, searchValue});
        }


        function removeDocument(researchEntity, doc) {
            if (doc.isDraft())
                return deleteDraft(researchEntity, doc.id);
            else
                return discardDocument(researchEntity, doc.id);
        }

        /* jshint ignore:start */

        async function getDoc(researchEntity, docId, docKind) {
            if (docKind === DocumentKinds.DRAFT)
                return service.getDraft(researchEntity, docId);
            else
                return service.getDocument(researchEntity, docId);
        }

        async function getDocument(researchEntity, documentId) {
            const populate = {populate: documentPopulates};

            const res = await researchEntity.one('documents', documentId).get(populate);
            const document = res[0];
            Restangular.restangularizeElement(researchEntity, document, 'documents');
            return document;

            // return Restangular.one('documents', documentId).get(populate);
        }

        async function getDraft(researchEntity, draftId) {
            var populate = {populate: documentPopulates};

            const res = await researchEntity.one('drafts', draftId).get(populate);
            const draft = res[0];
            Restangular.restangularizeElement(researchEntity, draft, 'drafts');
            return draft;
        }

        async function documentsNotDuplicate(researchEntity, doc1, doc2) {
            const data = {
                researchEntityId: researchEntity.id,
                document1Id: doc1.id,
                document2Id: doc2.id
            };
            await researchEntity.customPOST(data, 'documents-not-duplicate');
        }

        async function removeVerify(researchEntity, doc1Id, verificationData, doc2Id) {
            const verificationFields = ['position', 'affiliations', 'corresponding', 'synchronize'];
            verificationData = _.pick(verificationData, verificationFields);
            verificationData.document1Id = doc1Id;
            verificationData.document2Id = doc2Id;
            return researchEntity
                .customPOST(verificationData, 'remove-verify');
        }
        /* jshint ignore:end */

        return service;
    }
}());
