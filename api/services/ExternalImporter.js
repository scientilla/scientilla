/* global sails, ScopusExternalImporter, PublicationsExternalImporter, User, Group, DocumentOrigins, DocumentKinds */
// ExternalImporter.js - in api/services

"use strict";

module.exports = {
    updateUserExternal: async (id, origin) => {
        const user = await User.findOneById(id);
        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateUser(user);
        if (!origin || origin === DocumentOrigins.PUBLICATIONS)
            await PublicationsExternalImporter.updateUser(user);
    },
    updateGroupExternal: async (id, origin) => {
        const group = await Group.findOneById(id);
        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateGroup(group);
        if (!origin || origin === DocumentOrigins.PUBLICATIONS)
            await PublicationsExternalImporter.updateGroup(group);
    },
    updateAllExternal: async (origin) => {
        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateAll();
    },
    updateDocument: async (origin, id) => {
        if (origin === DocumentOrigins.SCOPUS)
            return await ScopusExternalImporter.updateDocument(id);
    },
    search: async (origin, searchKey, searchValue) => {
        if (origin !== DocumentOrigins.SCOPUS)
            throw 'Not implemented';

        const filedsMapper = {};
        filedsMapper[DocumentOrigins.SCOPUS] = {
            'originId': 'scopusId',
            'doi': 'doi'
        };

        let document;

        const criteria = {
            kind: DocumentKinds.EXTERNAL,
            origin: origin
        };
        criteria[filedsMapper[origin][searchKey]] = searchValue;
        document = await Document.findOne(criteria);

        if (!document && searchKey === 'doi') {
            if (!document) {
                const documentData = await Connector.getDocumentByDoi(origin, searchValue);
                document = await ExternalImporter.createExternalDocument(origin, documentData);
            }
        }
        if (!document && searchKey === 'originId') {
            document = await Document.findOneByDoi(searchValue);
            if (!document) {
                document = await ExternalImporter.updateDocument(origin, searchValue);
            }
        }

        if (!document.id) return false;

        return await Document.findOneById(document.id)
            .populate([
                'source',
                'authors',
                'authorships',
                'affiliations',
                'institutes'
            ]);

    },
    createExternalDocument: async (origin, documentData, synchronized = true) => {
        if (!documentData || !origin)
            return {};

        const fieldMapper = {};
        fieldMapper[DocumentOrigins.SCOPUS] = 'scopusId';
        fieldMapper[DocumentOrigins.PUBLICATIONS] = 'iitPublicationsId';

        const criteria = {
            origin: origin,
            kind: DocumentKinds.EXTERNAL
        };
        criteria[fieldMapper[origin]] = documentData[fieldMapper[origin]];

        documentData.origin = origin;
        documentData.kind = DocumentKinds.EXTERNAL;
        documentData.synchronized = synchronized;
        const documentType = await DocumentType.findOneByKey(documentData.type);
        documentData.documenttype = documentType;
        if (documentData.source)
            documentData.source = documentData.source.id;

        try {
            return await Document.createOrUpdate(criteria, documentData);
        } catch (err) {
            sails.log.debug(err);
            return {};
        }
    }
};