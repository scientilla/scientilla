/* global sails, Connector, DocumentKinds, DocumentOrigins, ExternalDocument, ExternalDocumentGroup, ScopusConnector, User, Group, Authorship */
// ScopusExternalImporter.js - in api/services

"use strict";

const _ = require('lodash');

const chunkSize = 100;

module.exports = {
    updateUser: async (user) => {
        if (_.isEmpty(user.scopusId)) {
            sails.log.info('ScopusExternalImporter: user ' + user.username + ' empty scopusId');
            return;
        }
        const total = await updateResearchEntityProfile(ExternalDocument, User, user);
        sails.log.info('updated/inserted ' + total + ' external documents of user ' + user.username);
    },
    updateGroup: async (group) => {
        if (_.isEmpty(group.scopusId)) {
            sails.log.info('ScopusExternalImporter: user ' + user.username + ' empty scopusId');
            return;
        }
        const total = await updateResearchEntityProfile(ExternalDocumentGroup, Group, group);
        sails.log.info('updated/inserted ' + total + ' scopus external documents of group ' + group.name);
    },
    updateAll: async () => {
        const usersDocumentsScopusIds = await getResearchEntitiesDocumentsScopusIds(User);
        const groupsDocumentsScopusIds = await getResearchEntitiesDocumentsScopusIds(Group);

        const currentExternalIds = (await Document.find({
            kind: DocumentKinds.EXTERNAL,
            origin: DocumentOrigins.SCOPUS
        })).map(ed => ed.scopusId);

        const userDocsIds = _.flatten(usersDocumentsScopusIds.map(ur => ur.scopusIds));
        const groupDocsIds = _.flatten(groupsDocumentsScopusIds.map(ur => ur.scopusIds));
        const docsIds = [...new Set(userDocsIds.concat(groupDocsIds).concat(currentExternalIds))];

        const importedDocuments = await importDocuments(docsIds);
        await updateAllExternalDocuments(ExternalDocument, usersDocumentsScopusIds, importedDocuments);
        await updateAllExternalDocuments(ExternalDocumentGroup, groupsDocumentsScopusIds, importedDocuments);

        sails.log.info('updated/inserted ' + importedDocuments.length + ' scopus external documents');
    },
    updateDocument: getAndCreateOrUpdateDocument
};

async function updateResearchEntityProfile(externalDocumentModel, researchEntityModel, researchEntity) {
    const documentScopusIds = await getResearchEntityDocumentsScopusIds(researchEntityModel, researchEntity);
    const importedDocuments = await importDocuments(documentScopusIds);
    await updateExternalDocuments(externalDocumentModel, researchEntity.id, importedDocuments);

    return importedDocuments.length;
}

async function getResearchEntitiesDocumentsScopusIds(researchEntityModel) {
    const researchEntities = await researchEntityModel.find({scopusId: {'!': ''}});
    let researchEntitiesScopusIds = [];

    for (let re of researchEntities)
        researchEntitiesScopusIds.push({
            researchEntity: re,
            scopusIds: await getResearchEntityDocumentsScopusIds(researchEntityModel, re)
        });

    return researchEntitiesScopusIds;
}

async function getResearchEntityDocumentsScopusIds(researchEntityModel, researchEntity) {
    const researchEntityId = researchEntity.id;
    const query = {
        limit: 200,
        skip: 0,
        where: {
            connector: 'Scopus',
            field: 'scopusId'
        }
    };

    if (researchEntity.getType() === 'user') {
        const res = await scopusLoop(query);
        return res.scopusIds;
    }

    const total = await getDocumentsTotal(query);
    const startingYear = ((new Date()).getFullYear()) + 1;

    return scopusYearLoop(query, startingYear, total);

    async function scopusYearLoop(baseQuery, year, total, totalDone = 0) {
        const query = _.cloneDeep(baseQuery);
        query.where.additionalFields = [
            {
                field: 'year',
                value: year
            }
        ];

        try {
            const res = await scopusLoop(query);
            const newTotalDone = totalDone + parseInt(res.done, 10);
            const documentsScopusIds = res.scopusIds;
            if (newTotalDone < total)
                return documentsScopusIds.concat(await scopusYearLoop(baseQuery, year - 1, total, newTotalDone));

            return documentsScopusIds;
        } catch (err) {
            sails.log.debug(err);
        }
    }

    async function scopusLoop(query) {
        const extracted = await scopusRequest(query);

        if (!extracted.documents)
            return {
                done: 0,
                scopusIds: []
            };

        const documentsScopusIds = extracted.documents.map(ed => getScopusId(ed));

        const nextQuery = _.cloneDeep(query);
        nextQuery.skip += query.limit;

        if (extracted.count <= nextQuery.skip)
            return {
                done: extracted.count,
                scopusIds: documentsScopusIds
            };

        const res = await scopusLoop(nextQuery);
        return {
            done: res.done,
            scopusIds: documentsScopusIds.concat(res.scopusIds)
        }
    }

    async function scopusRequest(query) {
        const config = await Connector.getConfig(researchEntityModel, researchEntityId, query);
        const res = await Connector.makeRequest(config);
        return config.fieldExtract(res.body);
    }

    async function getDocumentsTotal(query) {
        const countQuery = _.cloneDeep(query);
        countQuery.limit = 1;
        const res = await scopusRequest(countQuery);
        return res.count;
    }
}

async function updateAllExternalDocuments(externalDocumentsModel, researchEntitiesDocumentsScopusIds, importedDocuments) {
    for (let r of researchEntitiesDocumentsScopusIds) {
        const documents = _.filter(importedDocuments, d => _.includes(r.scopusIds, d.scopusId));
        await updateExternalDocuments(externalDocumentsModel, r.researchEntity.id, documents);
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


async function importDocuments(documents) {
    if (_.isEmpty(documents))
        return [];

    let documentsIds = [];
    const docsIterator = chunks(documents, chunkSize);

    for (let docs of docsIterator)
        documentsIds = documentsIds.concat(await updateDocs(docs));

    return documentsIds;

    async function updateDocs(documents) {
        const docs = await Promise.all(
            documents.map(
                async scopusId => {
                    try {
                        const document = await getAndCreateOrUpdateDocument(scopusId);
                        if (_.has(document, 'id'))
                            return document;
                    }
                    catch (err) {
                        sails.log.debug('Updater: Document failed ' + r.scopusId);
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
    if(!_.isEmpty(documentData))
        return await createOrUpdateDocument(documentData);
}

async function createOrUpdateDocument(documentData) {
    const criteria = {
        scopusId: documentData.scopusId,
        origin: DocumentOrigins.SCOPUS,
        kind: DocumentKinds.EXTERNAL
    };
    if (documentData.source)
        documentData.source = documentData.source.id;
    documentData.origin = DocumentOrigins.SCOPUS;
    documentData.kind = DocumentKinds.EXTERNAL;
    documentData.synchronized = true;

    try {
        return await Document.createOrUpdate(criteria, documentData);
    } catch (err) {
        sails.log.debug(err);
        return {};
    }

}

function* chunks(array, chunkSize) {
    const len = array.length;
    for (let i = 0; i < len; i += chunkSize) {
        yield array.slice(i, i + chunkSize);
    }
}