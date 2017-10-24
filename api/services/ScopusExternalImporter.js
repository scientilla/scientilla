/* global sails, Connector, DocumentKinds, DocumentOrigins, ExternalDocument, ExternalDocumentGroup, ScopusConnector, User, Group, Authorship, ExternalImporter, Citation */
// ScopusExternalImporter.js - in api/services

"use strict";

const _ = require('lodash');

const chunkSize = 100;
const interval = 12 * 60 * 60 * 1000;

module.exports = {
    updateUser: async (user) => {
        if (_.isEmpty(user.scopusId)) {
            sails.log.info('ScopusExternalImporter: user ' + user.username + ' empty scopusId');
            return;
        }
        const total = await updateResearchEntityProfile(ExternalDocument, user);
        sails.log.info('updated/inserted ' + total + ' scopus external documents of user ' + user.username);
    },
    updateGroup: async (group) => {
        if (_.isEmpty(group.scopusId)) {
            sails.log.info('ScopusExternalImporter: user ' + user.username + ' empty scopusId');
            return;
        }
        const total = await updateResearchEntityProfile(ExternalDocumentGroup, group);
        sails.log.info('updated/inserted ' + total + ' scopus external documents of group ' + group.name);
    },
    updateAll: async () => {
        let total;
        total = await updateResearchEntityProfiles(User, ExternalDocument);
        total += await updateResearchEntityProfiles(Group, ExternalDocumentGroup);

        const externalDocuments = await Document.find({
            kind: DocumentKinds.EXTERNAL,
            origin: DocumentOrigins.SCOPUS,
            updatedAt: {
                '<=': getUpdateLimitDate()
            }
        });
        const currentExternalIds = externalDocuments.map(ed => ed.scopusId);
        const importedDocuments = await importDocuments(currentExternalIds);

        total += importedDocuments.length;
        sails.log.info('updated/inserted ' + total + ' scopus external documents');
    },
    updateDocument: getAndCreateOrUpdateDocument
};

async function updateResearchEntityProfile(externalDocumentModel, researchEntity) {
    let documentScopusIds;
    try {
        documentScopusIds = await getResearchEntityDocumentsScopusIds(researchEntity);
    } catch (e) {
        return 0;
    }
    const importedDocuments = await importDocuments(documentScopusIds);
    await updateExternalDocuments(externalDocumentModel, researchEntity.id, importedDocuments);

    return importedDocuments.length;
}

async function updateResearchEntityProfiles(researchEntityModel, externalDocumentModel) {
    const researchEntities = await researchEntityModel.find({scopusId: {'!': ''}});

    let total = 0;

    for (let re of researchEntities)
        total += await updateResearchEntityProfile(externalDocumentModel, re);

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
    await externalDocumentsModel.destroy({
        researchEntity: researchEntityId,
        origin: DocumentOrigins.SCOPUS
    });

    for (let d of documents)
        await externalDocumentsModel.create({
            researchEntity: researchEntityId,
            document: d.id,
            origin: DocumentOrigins.SCOPUS
        })

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

    let documents = [];
    const docsIterator = chunks(documentScopusIds, chunkSize);

    for (let scopusId of docsIterator)
        documents = documents.concat(await updateDocs(scopusId));

    return documents;

    async function updateDocs(documentScopusIds) {
        const docs = await Promise.all(
            documentScopusIds.map(
                async scopusId => {

                    let document = await Document.findOne({
                        kind: DocumentKinds.EXTERNAL,
                        origin: DocumentOrigins.SCOPUS,
                        scopusId: scopusId
                    });

                    if (document && document.updatedAt > getUpdateLimitDate())
                        return document;

                    try {
                        document = await getAndCreateOrUpdateDocument(scopusId);
                        if (_.has(document, 'id')) {
                            await updateCitations(document);
                            return document;
                        }

                    }
                    catch (err) {
                        sails.log.debug('Updater: Document failed ' + scopusId);
                    }

                    return {};
                }
            )
        );
        return docs.filter(d => !_.isEmpty(d));
    }
}

async function getAndCreateOrUpdateDocument(scopusId) {
    const documentData = await ScopusConnector.getDocument(scopusId);
    if (!_.isEmpty(documentData))
        return await ExternalImporter.createExternalDocument(DocumentOrigins.SCOPUS, documentData);
    return {};
}

async function updateCitations(document) {
    const endDate = ((new Date()).getFullYear() + 1);
    const date = document.year + '-' + endDate;
    const citations = await ScopusConnector.getDocumentCitations(document.scopusId, date);

    for (const cit of citations)
        await Citation.createOrUpdate({
            origin: DocumentOrigins.SCOPUS,
            originId: document.scopusId,
            year: cit.year
        }, {
            origin: DocumentOrigins.SCOPUS,
            originId: document.scopusId,
            year: cit.year,
            citations: cit.value
        });

}

function* chunks(array, chunkSize) {
    const len = array.length;
    for (let i = 0; i < len; i += chunkSize) {
        yield array.slice(i, i + chunkSize);
    }
}

function getUpdateLimitDate() {
    return new Date((new Date()).getTime() - interval);
}