/* global sails, Connector, DocumentKinds, DocumentOrigins, ExternalDocument, ExternalDocumentGroup, ScopusConnector, User, Group, Authorship, ExternalImporter, Citation, ExternalDocumentMetadata */
// ScopusExternalImporter.js - in api/services

"use strict";

const _ = require('lodash');

const interval = 12 * 60 * 60 * 1000;

module.exports = {
    updateUser: async (user) => {
        if (_.isEmpty(user.scopusId)) {
            sails.log.info('ScopusExternalImporter: user ' + user.username + ' empty scopusId');
            return;
        }
        const invalidScopusIds = await getInvalidScopusIds();
        const total = await updateResearchEntityProfile(ExternalDocument, user, invalidScopusIds);
        sails.log.info('updated/inserted ' + total + ' scopus external documents of user ' + user.username);
    },
    updateGroup: async (group) => {
        if (_.isEmpty(group.scopusId)) {
            sails.log.info('ScopusExternalImporter: user ' + user.username + ' empty scopusId');
            return;
        }
        const invalidScopusIds = await getInvalidScopusIds();
        const total = await updateResearchEntityProfile(ExternalDocumentGroup, group, invalidScopusIds);
        sails.log.info('updated/inserted ' + total + ' scopus external documents of group ' + group.name);
    },
    updateAll: async () => {
        let total;
        const invalidScopusIds = await getInvalidScopusIds();
        total = await updateResearchEntityProfiles(User, ExternalDocument, invalidScopusIds);
        total += await updateResearchEntityProfiles(Group, ExternalDocumentGroup, invalidScopusIds);

        const externalDocuments = await Document.find({
            kind: DocumentKinds.EXTERNAL,
            origin: DocumentOrigins.SCOPUS,
            updatedAt: {
                '<=': getUpdateLimitDate()
            }
        });
        const currentExternalIds = externalDocuments.map(ed => ed.scopusId);

        const customDocuments = await Document.find({
            scopusId: {'!': ''},
            kind: DocumentKinds.VERIFIED
        });
        const currentCustomExternalIds = customDocuments.map(ed => ed.scopusId);

        const toImportScopusIds = [...new Set(currentExternalIds.concat(currentCustomExternalIds))];
        const importedDocuments = await importDocuments(_.difference(toImportScopusIds, invalidScopusIds));

        total += importedDocuments.length;
        sails.log.info('updated/inserted ' + total + ' scopus external documents');
    },
    updateDocument: getAndCreateOrUpdateDocument
};

async function updateResearchEntityProfile(externalDocumentModel, researchEntity, deletedFromScopus = []) {
    let documentScopusIds;
    try {
        documentScopusIds = await getResearchEntityDocumentsScopusIds(researchEntity);
        documentScopusIds = _.difference(documentScopusIds, deletedFromScopus);
    } catch (e) {
        return 0;
    }
    const importedDocuments = await importDocuments(documentScopusIds);
    await updateExternalDocuments(externalDocumentModel, researchEntity.id, importedDocuments);

    return importedDocuments.length;
}

async function updateResearchEntityProfiles(researchEntityModel, externalDocumentModel, deletedFromScopus = []) {
    const researchEntities = await researchEntityModel.find({scopusId: {'!': ''}});
    let total = 0;

    for (let re of researchEntities)
        total += await updateResearchEntityProfile(externalDocumentModel, re, deletedFromScopus);

    return total;
}

async function getResearchEntityDocumentsScopusIds(researchEntity) {
    const params = {
        limit: 200,
        skip: 0
    };

    if (researchEntity.getType() === 'user') {
        params.type = 'author';
        const res = await scopusLoop(researchEntity.scopusId, params);
        return res.scopusIds;
    }

    params.type = 'affiliation';
    let scopusIds = [];

    if (researchEntity.institute) {
        const childInstitutes = await Institute.find({parentId: researchEntity.institute});
        for (let childInstitute of childInstitutes) {
            if (!childInstitute.scopusId) continue;
            const res = await scopusLoop(childInstitute.scopusId, params);
            scopusIds = scopusIds.concat(res.scopusIds);
        }
    }

    const total = await getDocumentsTotal(researchEntity.scopusId, params);
    const startingYear = ((new Date()).getFullYear()) + 1;

    return scopusIds.concat(await scopusYearLoop(researchEntity.scopusId, params, startingYear, total));

    async function scopusYearLoop(scopusId, baseParams, year, total, totalDone = 0) {
        const params = _.cloneDeep(baseParams);
        params.additionalFields = {'year': year};

        try {
            const res = await scopusLoop(scopusId, params);
            const newTotalDone = totalDone + parseInt(res.done, 10);
            const documentsScopusIds = res.scopusIds;
            if (newTotalDone < total)
                return documentsScopusIds.concat(await scopusYearLoop(scopusId, baseParams, year - 1, total, newTotalDone));

            return documentsScopusIds;
        } catch (err) {
            sails.log.debug(err);
        }
    }

    async function scopusLoop(scopusId, params) {
        const extracted = await scopusRequest(scopusId, params);
        if (!extracted.documents)
            return {
                done: 0,
                scopusIds: []
            };

        const documentsScopusIds = extracted.documents.map(ed => getScopusId(ed));

        const nextParams = _.cloneDeep(params);
        nextParams.skip += params.limit;

        if (extracted.count <= nextParams.skip)
            return {
                done: extracted.count,
                scopusIds: documentsScopusIds
            };

        const res = await scopusLoop(scopusId, nextParams);
        return {
            done: res.done,
            scopusIds: documentsScopusIds.concat(res.scopusIds)
        }
    }

    async function scopusRequest(scopusId, params) {
        const config = await Connector.getConfig(DocumentOrigins.SCOPUS, scopusId, params);
        const res = await Connector.makeRequest(config);
        return config.fieldExtract(res.body);
    }

    async function getDocumentsTotal(scopusId, params) {
        const countParams = _.cloneDeep(params);
        countParams.limit = 1;
        const res = await scopusRequest(scopusId, countParams);
        return res.count;
    }
}

async function updateExternalDocuments(externalDocumentsModel, researchEntityId, documents) {
    if (documents.length === 0)
        return;

    const externalDocuments = await externalDocumentsModel.find({
        researchEntity: researchEntityId,
        origin: DocumentOrigins.SCOPUS
    });

    const toCreateExDocsIds = documents.filter(d => !externalDocuments.find(ed => d.id === ed.document)).map(d => d.id);
    const toDestroyExDocsIds = externalDocuments.filter(ed => !documents.find(d => d.id === ed.document)).map(ed => ed.document);

    for (let id of toCreateExDocsIds)
        await externalDocumentsModel.create({
            researchEntity: researchEntityId,
            document: id,
            origin: DocumentOrigins.SCOPUS
        });

    for (let id of toDestroyExDocsIds)
        await externalDocumentsModel.destroy({
            researchEntity: researchEntityId,
            document: id,
            origin: DocumentOrigins.SCOPUS
        });
}

function getScopusId(d) {
    const identifier = d['dc:identifier'];
    if (_.startsWith(identifier, 'SCOPUS_ID:')) {
        return _.replace(identifier, 'SCOPUS_ID:', '');
    }
    const eid = d['eid'];
    if (_.startsWith(eid, '2-s2.0-')) {
        return _.trimStart(eid, '2-s2.0-');
    }
    return null;
}


async function importDocuments(documentScopusIds) {
    if (_.isEmpty(documentScopusIds))
        return [];

    const documents = [];
    for (const scopusId of documentScopusIds) {
        let d = await Document.findOne({
            kind: DocumentKinds.EXTERNAL,
            origin: DocumentOrigins.SCOPUS,
            scopusId: scopusId
        });

        if (d && d.updatedAt > getUpdateLimitDate()) {
            documents.push(d);
            continue;
        }

        try {
            const document = await getAndCreateOrUpdateDocument(scopusId);
            await updateCitations(document);
            documents.push(document);
        }
        catch (err) {
            sails.log.debug(err);
        }
    }

    return documents;
}

async function getAndCreateOrUpdateDocument(scopusId) {
    const documentData = await ScopusConnector.getDocument(scopusId);
    if (!_.has(documentData, 'scopusId')) {
        if (documentData.message === 'RESOURCE_NOT_FOUND' && scopusId) {
            await ExternalDocumentMetadata.setData(
                DocumentOrigins.SCOPUS,
                scopusId,
                'scopusIdInvalid',
                true);
            throw 'Scopus id:' + scopusId + ' set to deleted because no longer exists';
        }
        throw 'Updater: Document failed ' + scopusId;
    }

    const document = await ExternalImporter.createOrUpdateExternalDocument(DocumentOrigins.SCOPUS, documentData);

    if (!_.has(document, 'scopusId'))
        throw 'Updater: Document failed ' + scopusId;

    return document;
}

async function updateCitations(document) {
    const citations = await ScopusConnector.getDocumentCitations(document.scopusId);
    if(!citations)
        return;

    citations.sort((a, b) => a.year > b.year);

    await ExternalDocumentMetadata.setData(
        DocumentOrigins.SCOPUS,
        document.scopusId,
        'citations',
        citations);
}

function getUpdateLimitDate() {
    return new Date((new Date()).getTime() - interval);
}

async function getInvalidScopusIds() {
    const extrenalMetadatas = await ExternalDocumentMetadata.find({origin: DocumentOrigins.SCOPUS});
    return extrenalMetadatas.filter(em => em.data.scopusIdInvalid).map(em => em.origin_id);

}