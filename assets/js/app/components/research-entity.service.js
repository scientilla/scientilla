(function () {

    angular.module("components").factory("researchEntityService", ResearchEntityServiceFactory);


    ResearchEntityServiceFactory.$inject = [
        'Restangular',
        'DocumentLabels'
    ];

    function ResearchEntityServiceFactory(Restangular, DocumentLabels) {
        var service = {};

        service.getDocuments = getDocuments;
        service.getDraft = getDraft;
        service.getDrafts = getDrafts;
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
        service.setAuthorshipPrivacy = setAuthorshipPrivacy;
        service.setAuthorshipFavorite = setAuthorshipFavorite;

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

        function getDraft(researchEntity, draftId) {
            var populate = {populate: documentPopulates};

            return researchEntity.one('drafts', draftId).get(populate);
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
            const verificationFields = ['position', 'affiliations', 'corresponding', 'synchronize', 'public'];
            verificationData = _.pick(verificationData, verificationFields);
            verificationData.id = id;
            return researchEntity
                .post('documents', verificationData);
        }

        function verifyDraftAsGroup(researchEntity, draftId) {
            return researchEntity.one('drafts', draftId)
                .customPUT({public: true}, 'verified');
        }

        function verifyDraftAsUser(researchEntity, draftId, verificationData) {
            const verificationFields = ['position', 'affiliations', 'corresponding', 'synchronize', 'public'];
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
            const documentIds = documents.filter(d => d.kind === 'e').map(d => d.id);
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

        return service;
    }
}());
