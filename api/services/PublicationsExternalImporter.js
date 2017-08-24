/* global sails, Connector, DocumentKinds, DocumentOrigins, ExternalDocument, ExternalDocumentGroup, User, Group, Authorship */
// PublicationsExternalImporter.js - in api/services

"use strict";

const _ = require('lodash');

module.exports = {
    updateUser: async (user) => {
        const count = await updateResearchEntityProfile(user);
        sails.log.info('updated/inserted ' + count + ' publications external documents of user ' + user.username);
    },
    updateGroup: async (group) => {
        const count = await updateResearchEntityProfile(group);
        sails.log.info('updated/inserted ' + count + ' publications external documents of group ' + group.name);
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

    let searchKey, externalDocumentModel;
    if (researchEntity.getType() === 'user') {
        searchKey = 'username';
        externalDocumentModel = ExternalDocument;
    } else {
        searchKey = 'publicationsAcronym';
        externalDocumentModel = ExternalDocumentGroup;
    }

    const params = {
        limit: 9999999, //TODO change
        skip: 0,
        type: 'author'
    };
    const res = await Connector.getDocuments(DocumentOrigins.PUBLICATIONS, researchEntity[searchKey], params);
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
        const document = await ExternalImporter.createExternalDocument(DocumentOrigins.PUBLICATIONS, data, false);
        if (_.has(document, 'id'))
            createdDocumentsIds.push(document.id);
    }

    return createdDocumentsIds;
}