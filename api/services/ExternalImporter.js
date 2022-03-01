/* global sails, ScopusExternalImporter, User, Group, DocumentOrigins, DocumentKinds, OpenaireImporter */
// ExternalImporter.js - in api/services

"use strict";

module.exports = {
    updateUserExternal: async (id, origin) => {
        let user;

        if (!sails.config.connectors.elsevier.active) {
            console.log('\nThe elsevier connector is not active, please fill in all necessary fields\n');
            return false;
        }

        user = await User.findOneById(id);

        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateUser(user);
    },
    updateGroupExternal: async (id, origin) => {
        let group;

        if (!sails.config.connectors.elsevier.active) {
            console.log('\nThe elsevier connector is not active, please fill in all necessary fields\n');
            return false;
        }

        group = await Group.findOneById(id);

        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateGroup(group);
    },
    updateAllExternal: async (origin) => {
        if (!sails.config.connectors.elsevier.active) {
            console.log('\nThe elsevier connector is not active, please fill in all necessary fields\n');
            return false;
        }
        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateAll();
    },
    async updateMetadata(origin) {
        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateAllMetadata();
        if (!origin || origin === DocumentOrigins.OPENAIRE)
            await OpenaireImporter.updateAllMetadata();
    },
    async updateDocumentMetadata(document, origin) {
        try{
            if ((!origin || origin === DocumentOrigins.SCOPUS) && document.scopusId)
                await ScopusExternalImporter.updateMetadata(document.scopusId);
            if ((!origin || origin === DocumentOrigins.OPENAIRE) && document.doi)
                await OpenaireImporter.updateMetadata(document.doi);
        } catch (e) {
            console.log(e);
        }
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
                document = await ExternalImporter.createOrUpdateExternalDocument(origin, documentData);
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
    createOrUpdateExternalDocument: async (origin, documentData, synchronized = true) => {
        if (!documentData || !origin)
            return {};

        const fieldMapper = {};
        fieldMapper[DocumentOrigins.SCOPUS] = 'scopusId';
        fieldMapper[DocumentOrigins.PUBLICATIONS] = 'iitPublicationsId';

        const criteria = {
            origin: origin,
            kind: DocumentKinds.EXTERNAL,
            [fieldMapper[origin]]: documentData[fieldMapper[origin]]
        };

        documentData.origin = origin;
        documentData.kind = DocumentKinds.EXTERNAL;
        documentData.synchronized = synchronized;
        documentData.synchronized_at = synchronized ? new Date() : null;

        try {
            return await Document.createOrUpdate(criteria, documentData);
        } catch (err) {
            sails.log.debug(err);
            return {};
        }
    }
};
