/* global sails, Connector, DocumentKinds, DocumentOrigins, ExternalId, ExternalIdGroup, ScopusConnector, User, Group, Authorship */
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

        await importProfileIds(ExternalId, User, user);
        const userDocsIdsRows = await ExternalId.find({
            researchEntity: user.scopusId,
            origin: DocumentOrigins.SCOPUS
        });
        const userDocsIds = userDocsIdsRows.map(i => i.document);
        await updateDocuments(userDocsIds);
        sails.log.info('updated/inserted ' + userDocsIds.length + ' external documents of user ' + user.username);

    },
    updateGroup: async (group) => {
        await importProfileIds(ExternalIdGroup, Group, group);
        const groupDocsIdsRows = await ExternalIdGroup.find({
            researchEntity: group.scopusId,
            origin: DocumentOrigins.SCOPUS
        });
        const groupDocsIds = groupDocsIdsRows.map(i => i.document);
        await updateDocuments(groupDocsIds);
        sails.log.info('updated/inserted ' + groupDocsIds.length + ' scopus external documents of group ' + group.name);
    },
    updateAll: async () => {
        await updateUserProfiles();
        await updateGroupProfiles();

        const userDocsIdsRows = await ExternalId.findByOrigin(DocumentOrigins.SCOPUS);
        const groupDocsIdsRows = await ExternalIdGroup.findByOrigin(DocumentOrigins.SCOPUS);

        const userDocsIds = userDocsIdsRows.map(i => i.document);
        const groupDocsIds = groupDocsIdsRows.map(i => i.document);
        const docsIds = [...new Set(userDocsIds.concat(groupDocsIds))];

        await updateDocuments(docsIds);

        sails.log.info('updated/inserted ' + docsIds.length + ' scopus external documents');
    },

};

async function updateUserProfiles() {
    const users = await User.find({scopusId: {'!': ''}});

    for (let u of users)
        await importProfileIds(ExternalId, User, u);
}

async function updateGroupProfiles() {
    const groups = await Group.find({scopusId: {'!': ''}});

    for (let g of groups)
        await importProfileIds(ExternalIdGroup, Group, g);
}

async function importProfileIds(externalIdModel, researchEntityModel, researchEntity) {
    await externalIdModel.destroy({researchEntity: researchEntity.scopusId});

    const researchEntityId = researchEntity.id;
    const researchEntityScopusId = researchEntity.scopusId;

    const query = {
        limit: 200,
        skip: 0,
        where: {
            connector: 'Scopus',
            field: 'scopusId'
        }
    };

    if (researchEntity.getType() === 'user')
        return scopusLoop(query);

    const total = await getDocumentsTotal(query);
    const startingYear = ((new Date()).getFullYear()) + 1;

    await scopusYearLoop(query, startingYear, total);

    async function scopusYearLoop(baseQuery, year, total, done = 0) {
        const query = _.cloneDeep(baseQuery);
        query.where.additionalFields = [
            {
                field: 'year',
                value: year
            }
        ];

        try {
            const count = await scopusLoop(query);
            const newDone = done + parseInt(count, 10);
            if (newDone < total)
                return scopusYearLoop(baseQuery, year - 1, total, newDone);
        } catch (err) {
            sails.log.debug(err);
        }
    }

    async function scopusLoop(query) {
        const extracted = await scopusRequest(query);

        if (!extracted.documents)
            return extracted.count;

        const documents = extracted.documents.map(ed => getScopusId(ed));

        for (let d of documents)
            await externalIdModel.create({
                researchEntity: researchEntityScopusId,
                document: d,
                origin: DocumentOrigins.SCOPUS
            })

        if (extracted.count <= (query.limit + query.skip))
            return extracted.count;

        const nextQuery = _.cloneDeep(query);
        nextQuery.skip += query.limit;

        return scopusLoop(nextQuery);
    }

    async function scopusRequest(query) {
        const config = await Connector.getConfig(researchEntityModel, researchEntityId, query);
        const res = await Connector.makeRequest(config);
        return config.fieldExtract(res.body);
    }
}

async function getDocumentsTotal(query) {
    const countQuery = _.cloneDeep(query);
    countQuery.limit = 1;
    const res = await scopusRequest(countQuery);
    return res.count;
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


async function updateDocuments(documents) {
    const docsIterator = chunks(documents, chunkSize);

    for (let docs of docsIterator)
        await updateDocs(docs);

    async function updateDocs(documents) {
        const results = await Promise.all(
            documents.map(
                async sId => {
                    try {
                        return {
                            scopusId: sId,
                            data: await ScopusConnector.getDocument(sId)
                        }
                    }
                    catch (err) {
                        return {
                            scopusId: sId,
                            data: false
                        };
                    }
                }
            )
        );

        for (let r of results) {
            if (r.data)
                await createOrUpdateDocument(r.data);
            else
                sails.log.debug('Updater: Document failed ' + r.scopusId);
        }
    }
}

async function createOrUpdateDocument(documentData) {
    const criteria = {
        scopusId: documentData.scopusId,
        origin: DocumentOrigins.SCOPUS,
        kind: DocumentKinds.EXTERNAL
    };
    documentData.source = documentData.source.id;
    documentData.origin = DocumentOrigins.SCOPUS;
    documentData.kind = DocumentKinds.EXTERNAL;

    try {
        await Document.createOrUpdate(criteria, documentData);
    } catch (err) {
        sails.log.debug(err);
    }

}

function* chunks(array, chunkSize) {
    const len = array.length;
    for (let i = 0; i < len; i += chunkSize) {
        yield array.slice(i, i + chunkSize);
    }
}