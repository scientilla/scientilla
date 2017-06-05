/* global sails, Connector, DocumentKinds, DocumentOrigins, ExternalDocument, ExternalDocumentGroup, ScopusConnector, User, Group, Authorship */
// PublicationsExternalImporter.js - in api/services

"use strict";

const _ = require('lodash');

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

        //TODO OPTIMIZE
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

    //TODO change this
    const mainInstitute = await Group.findOne({id: 1});
    groups.push(mainInstitute);

    let count = 0;
    for (let g of groups)
        count += await updateResearchEntityProfile(g);

    return count;
}

async function updateResearchEntityProfile(researchEntity) {

    let researchEntityModel, publicationsResearchEntityField, externalDocumentModel;
    if (researchEntity.getType() === 'user') {
        researchEntityModel = User;
        publicationsResearchEntityField = 'username';
        externalDocumentModel = ExternalDocument;
    } else {
        researchEntityModel = Group;
        publicationsResearchEntityField = 'publicationsAcronym';
        externalDocumentModel = ExternalDocumentGroup;
    }

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
    const documentsIds = await createOrUpdateDocuments(documents);
    await updateProfile(externalDocumentModel, researchEntity.id, documentsIds);
    await createOrUpdateDocuments(documents);

    return documentsIds.length;
}

async function updateProfile(externalDocumentModel, researchEntityId, documentsIds) {
    await externalDocumentModel.destroy({
        researchEntity: researchEntityId,
        origin: DocumentOrigins.PUBLICATIONS
    });

    for (let id of documentsIds)
        await externalDocumentModel.create({
            researchEntity: researchEntityId,
            document: id,
            origin: DocumentOrigins.PUBLICATIONS
        })
}

async function createOrUpdateDocuments(documentsData) {
    const createdDocumentsIds = [];
    for (let data of documentsData) {
        const document = await createOrUpdateDocument(data);
        if (_.has(document, 'id'))
            createdDocumentsIds.push(document.id);
    }

    return createdDocumentsIds;
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
        return await Document.createOrUpdate(criteria, documentData);
    } catch (err) {
        sails.log.debug(err);
        return {};
    }
}