/* global Document, sails, User, ObjectComparer, Authorship, DocumentKinds, ExternalImporter, DocumentOrigins, Synchronizer */
// Synchronizer.js - in api/services

const _ = require('lodash');

"use strict";

module.exports = {
    synchronizeScopus,
    documentSynchronizeScopus
};

const documentPopulates = [
    'authorships',
    'groupAuthorships',
    'affiliations'
];

async function synchronizeScopus() {
    sails.log.info("Scopus synchronization starting");

    const limit = 1000;
    let skip = 0;
    let documentSynchronized = 0;
    let documentsToSynchronize;

    do {
        documentsToSynchronize = await Document.find({
            synchronized: true,
            kind: [DocumentKinds.DRAFT, DocumentKinds.VERIFIED],
            origin: DocumentOrigins.SCOPUS
        }).populate(documentPopulates)
            .sort('id ASC')
            .limit(limit)
            .skip(skip);

        sails.log.info('working on ' + documentsToSynchronize.length + ' documents');
        for (let doc of documentsToSynchronize) {
            const externalDoc = await Document.findOne({
                scopusId: doc.scopusId,
                kind: DocumentKinds.EXTERNAL,
                origin: DocumentOrigins.SCOPUS,
            }).populate(documentPopulates);

            if (!externalDoc) {
                sails.log.debug('Synchronization failed: Document with id ' + doc.id + " has no corresponding external document");
                continue;
            }

            try {
                const res = await documentSynchronize(doc, externalDoc);
                if (res)
                    documentSynchronized++;
            }
            catch (e) {
                sails.log.debug(e);
            }
        }

        skip = skip + limit;
    } while (documentsToSynchronize.length === limit);
    sails.log.info(documentSynchronized + ' documents synchronized');
}

async function documentSynchronizeScopus(docId) {
    const doc = await Document.findOneById(docId).populate(documentPopulates);
    if (!doc)
        throw 'Document not found';

    let exceptionMessage,
        searchKey,
        documentField;

    if (doc.scopusId) {
        searchKey = 'originId';
        documentField = 'scopusId';
        exceptionMessage = 'Scopus Id rejected by Scopus, scopusId: ' + doc.scopusId;
    }
    else if (doc.doi) {
        searchKey = 'doi';
        documentField = 'doi';
        exceptionMessage = 'DOI not found on scopus (' + doc.doi + ')';
    }
    else
        throw "Document's scopus id or DOI not found";

    const criteria = {
        kind: DocumentKinds.EXTERNAL,
        origin: DocumentOrigins.SCOPUS
    };
    criteria[documentField] = doc[documentField];

    let externalDoc = await Document.findOne(criteria).populate(documentPopulates);

    if (!externalDoc) {
        await ExternalImporter.search(DocumentOrigins.SCOPUS, searchKey, doc[documentField]);
        externalDoc = await Document.findOne(criteria).populate(documentPopulates);
    }

    if (!externalDoc)
        throw exceptionMessage;

    return await documentSynchronize(doc, externalDoc);
}

async function documentSynchronize(doc, externalDoc) {
    const docData = Document.selectData(doc);
    const externalDocData = Document.selectData(externalDoc);
    const differences = getDifferences(docData, externalDocData);
    checkAuthors(doc, externalDoc);
    const positionsToUpdate = getAuthorshipPositionsToUpdate(doc, externalDoc);

    if (_.isEmpty(differences) && !positionsToUpdate.length) {
        if (!doc.synchronized)
            await Document.update({id: doc.id}, {synchronized: true});
        return false;
    }

    let docToUpdate = doc;

    if (doc.kind === DocumentKinds.VERIFIED) {
        docToUpdate = await documentSplit(doc);

        if (!docToUpdate) {
            sails.log.debug('Document with id ' + doc.id + " has no corresponding external document");
            throw "Synchronization failed";
        }
    }

    await synchronizeAuthorships(docToUpdate, externalDoc, positionsToUpdate);

    delete externalDocData.kind;
    externalDocData.synchronized = true;
    if (docToUpdate.type !== externalDocData.type) {
        await Document.fixDocumentType(externalDocData);
    }
    await Document.update(docToUpdate.id, externalDocData);

    return true;
}

function getDifferences(d1, d2) {
    if (d1.kind === DocumentKinds.EXTERNAL || d2.kind !== DocumentKinds.EXTERNAL)
        throw 'wrong method call';
    const documentFields = Document.getFields();
    _.remove(documentFields, f => f === 'kind' || f === 'synchronized');
    return _.pickBy(d2, (v, k) => documentFields.includes(k) && v != d1[k]);
}

function checkAuthors(doc, externalDoc) {
    if (!doc.authorsStr || doc.kind === DocumentKinds.DRAFT)
        return;

    const docAuthors = doc.authorsStr.split(', ');
    const externalDocAuthors = externalDoc.authorsStr.split(', ');

    if (docAuthors.length !== externalDocAuthors.length)
        throw 'Authors changed! Doc id:' + doc.id;

    docAuthors.forEach((author, i) => {
        if (author !== externalDocAuthors[i])
            throw 'Authors changed! Doc id:' + doc.id;
    });
}

function getAuthorshipPositionsToUpdate(doc, externalDoc) {
    const docFullAuthorships = doc.getFullAuthorships();
    const externalFullAuthorships = externalDoc.getFullAuthorships();

    return externalDoc.authorsStr.split(',').reduce((acc, v, i) => {
        const docAuthorship = docFullAuthorships.find(a => a.position === i);
        const externalAuthorship = externalFullAuthorships.find(a => a.position === i);
        if (!docAuthorship && !externalAuthorship)
            return acc;

        if (_.isObject(docAuthorship) && docAuthorship.researchEntity)
            return acc;

        if (!docAuthorship ^ !externalAuthorship) {
            return acc.concat([i]);
        }

        const docAffiliationIds = docAuthorship.affiliations.map(a => a.institute);
        const externalAffiliationIds = externalAuthorship.affiliations.map(a => a.institute);

        if (!_.isEqual(docAffiliationIds.sort(), externalAffiliationIds.sort()))
            return acc.concat([i]);

        return acc;
    }, []);
}

async function documentSplit(doc) {
    //a.synchronize could be null
    const notSynchronizingAuthorships = doc.authorships.filter(a => a.synchronize === false);

    if (notSynchronizingAuthorships.length === doc.authorships.filter(a => !_.isNil(a.synchronize).length))
        return false;
    if (!notSynchronizingAuthorships.length)
        return doc;

    const newDoc = await Document.clone(doc, {synchronized: false});

    const notSynchronizingAuthors = notSynchronizingAuthorships.map(nsa => nsa.researchEntity);

    const authorshipsData = doc.getFullAuthorships();
    const oldDocAuthorshipsData = authorshipsData.map(a => {
        if (!notSynchronizingAuthors.includes(a.researchEntity)) {
            const newAutorhsip = _.cloneDeep(a);
            a.researchEntity = null;
            a.synchronize = null;
            return newAutorhsip;
        }
        else return a;
    });

    const newDocAuthorshipsData = authorshipsData.map(a => {
        if (notSynchronizingAuthors.includes(a.researchEntity)) {
            const newAutorhsip = _.cloneDeep(a);
            a.researchEntity = null;
            a.synchronize = null;
            return newAutorhsip;
        }
        else return a;
    });
    await Document.setAuthorships(newDoc.id, newDocAuthorshipsData);
    return await Document.setAuthorships(doc.id, oldDocAuthorshipsData);
}

async function synchronizeAuthorships(doc, externalDoc, positionsToUpdate) {
    const externalAuthorshipsData = externalDoc.getFullAuthorships();
    const authorshipsData = doc.getFullAuthorships();

    for (const i of positionsToUpdate) {
        const authData = authorshipsData.find(a => a.position === i);
        const externalAuthData = externalAuthorshipsData.find(a => a.position === i);

        if (authData && externalAuthData) {
            const newAuthorship = Authorship.clone(authData);
            if (!authData.researchEntity)
                newAuthorship.affiliations = externalAuthData.affiliations;
            await Authorship.updateAuthorshipData(authData.id, doc.id, newAuthorship);
        }
        else if (!authData && externalAuthData)
            await Authorship.createAuthorshipData(doc.id, externalAuthData);
        else if (authData)
            await Authorship.destroy({id: authorshipsData.id});
    }

}