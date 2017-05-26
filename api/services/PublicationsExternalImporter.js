/* global sails, Connector, DocumentKinds, DocumentOrigins, ExternalId, ExternalIdGroup, ScopusConnector, User, Group, Authorship */
// PublicationsExternalImporter.js - in api/services

"use strict";

module.exports = {
    updateUser: async (user) => {
        const count = await updateResearchEntityProfile(user);
        sails.log.info('updated/inserted ' + count + ' publications external documents of user ' + user.id);
    },
    updateGroup: async (group) => {
        const count = await updateResearchEntityProfile(group);
        sails.log.info('updated/inserted ' + count + ' publications external documents of group ' + group.id);
    },
    updateAll: async () => {
        let count = 0;

        count += await updateUserProfiles();
        count += await updateGroupProfiles();
        sails.log.info('updated/inserted ' + count + ' publications external documents');
    }
};

async function updateUserProfiles() {
    const users = await User.find({username: {'!': ''}});

    let count = 0;
    for (let u of users)
        count += await updateResearchEntityProfile(u);

    return count;
}

async function updateGroupProfiles() {
    const groups = await Group.find({publicationsAcronym: {'!': ''}});

    let count = 0;
    for (let g of groups)
        count += await updateResearchEntityProfile(g);

    return count;
}

async function updateResearchEntityProfile(researchEntity) {

    let researchEntityModel, publicationsResearchEntityField, externalIdModel;
    if (researchEntity.getType() === 'user') {
        researchEntityModel = User;
        publicationsResearchEntityField = 'username';
        externalIdModel = ExternalId;
    } else {
        researchEntityModel = Group;
        publicationsResearchEntityField = 'publicationsAcronym';
        externalIdModel = ExternalIdGroup;
    }

    if(!researchEntity[publicationsResearchEntityField])
        throw 'empty publications ResearchEntity field';

    const query = {
        where: {
            connector: 'Publications',
            field: publicationsResearchEntityField,
            type: 'all'
        },
        limit: 9999999, //TODO change
        skip: 0
    };
    const res = await Connector.getDocuments(researchEntityModel, researchEntity.id, query);
    const documents = res.items;
    const documentsIds = documents.map(d => d.iitPublicationsId);
    await updateProfile(externalIdModel, researchEntity[publicationsResearchEntityField], documentsIds);
    await createOrUpdateDocuments(documents);

    return res.count;
}

async function updateProfile(externalIdModel, researchEntityKey, documentsIds) {
    await externalIdModel.destroy({
        researchEntity: researchEntityKey,
        origin: DocumentOrigins.PUBLICATIONS
    });

    for (let id of documentsIds)
        await externalIdModel.create({
            researchEntity: researchEntityKey,
            document: id,
            origin: DocumentOrigins.PUBLICATIONS
        })
}

async function createOrUpdateDocuments(documents) {
    for (let data of documents)
        await createOrUpdateDocument(data);
}


async function createOrUpdateDocument(documentData) {
    const criteria = {
        iitPublicationsId: documentData.iitPublicationsId,
        origin: DocumentOrigins.PUBLICATIONS,
        kind: DocumentKinds.EXTERNAL
    };
    if (documentData.source)
        documentData.source = documentData.source.id;
    documentData.origin = DocumentOrigins.PUBLICATIONS;
    documentData.kind = DocumentKinds.EXTERNAL;
    try {
        await Document.createOrUpdate(criteria, documentData);
    } catch (err) {
        sails.log.debug(err);
    }
}