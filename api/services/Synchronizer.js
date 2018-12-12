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
    const authorshipsSynch = await Authorship.find({synchronize: true});
    const documentIds = authorshipsSynch.map(a => a.document);
    let slicedDocumentIds;

    do {
        slicedDocumentIds = documentIds.slice(skip, skip + limit);
        await Document.update({id: slicedDocumentIds}, {synchronized: false});
        documentsToSynchronize = await Document.find({id: slicedDocumentIds})
            .populate(documentPopulates);

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
            } catch (e) {
                sails.log.debug(e);
            }
        }

        skip = skip + limit;
    } while (slicedDocumentIds.length > 0);
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
    } else if (doc.doi) {
        searchKey = 'doi';
        documentField = 'doi';
        exceptionMessage = 'DOI not found on scopus (' + doc.doi + ')';
    } else
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

    await documentSynchronize(doc, externalDoc);

    return await Document.findOne({id: doc.id}).populate(documentPopulates)
}

async function documentSynchronize(doc, externalDoc) {
    const docData = Document.selectData(doc);
    const externalDocData = Document.selectData(externalDoc);
    const differences = getDifferences(docData, externalDocData);
    checkAuthors(doc, externalDoc);
    const positionsToUpdate = getAuthorshipPositionsToUpdate(doc, externalDoc);

    if (_.isEmpty(differences) && !positionsToUpdate.length) {
        await Document.update({id: doc.id}, {synchronized: true, synchronized_at: externalDoc.synchronized_at});
        return false;
    }

    let docToUpdate = doc;

    if (doc.kind === DocumentKinds.VERIFIED) {
        docToUpdate = await documentSplit(doc);

        if (!docToUpdate)
            return false;
    }


    delete externalDocData.kind;
    if (docToUpdate.type !== externalDocData.type) {
        await Document.fixDocumentType(externalDocData);
    }
    await Document.update(docToUpdate.id, externalDocData);
    const updatedDoc = await Document.findOne({id: docToUpdate.id}).populate(documentPopulates);

    const newAuthorships = getAuthorshipsToUpdate(updatedDoc, externalDoc, positionsToUpdate);
    await Authorship.updateAuthorships(updatedDoc, newAuthorships);

    return true;
}

function getDifferences(d1, d2) {
    if (d1.kind === DocumentKinds.EXTERNAL || d2.kind !== DocumentKinds.EXTERNAL)
        throw 'wrong method call';

    const excludedFields = ['kind', 'synchronized', 'synchronized_at'];
    const filteredDocumentFields = Document.getFields().filter(f => !excludedFields.includes(f));
    return _.pickBy(d2, (v, k) => filteredDocumentFields.includes(k) && v !== d1[k]);
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

    return externalDoc.getAuthors().reduce((acc, v, i) => {
        const docAuthorship = docFullAuthorships.find(a => a.position === i);
        const externalAuthorship = externalFullAuthorships.find(a => a.position === i);
        if (!docAuthorship && !externalAuthorship)
            return acc;

        if (_.isObject(docAuthorship) && docAuthorship.researchEntity)
            return acc;

        if (!docAuthorship ^ !externalAuthorship) {
            return acc.concat([i]);
        }

        if (!Authorship.isMetadataEqual(docAuthorship, externalAuthorship, ['affiliations', 'corresponding']))
            return acc.concat([i]);

        return acc;
    }, []);
}

// if the document is verified with at least a synchronize = true and a syncronize = false it will create a new document
// returns the document that will be updated (the old one)
async function documentSplit(doc) {
    //a.synchronize could be null
    function isSynchronizing(authorship) {
        return authorship.researchEntity && authorship.synchronize === false;
    }

    const notSynchronizingAuthorships = doc.authorships.filter(isSynchronizing);

    if (notSynchronizingAuthorships.length === doc.authorships.filter(a => !_.isNil(a.synchronize)).length)
        return false;
    if (!notSynchronizingAuthorships.length)
        return doc;

    const newDoc = await Document.clone(doc, {synchronized: false});

    const authorshipsData = doc.getFullAuthorships().map(a => {
        const newAutorhsip = _.cloneDeep(a);
        newAutorhsip.affiliations = newAutorhsip.affiliations.map(af => af.institute);
        return newAutorhsip;
    });
    const oldDocAuthorshipsData = authorshipsData.map(a => {
        if (isSynchronizing(a)) {
            const newAutorhsip = _.cloneDeep(a);
            newAutorhsip.researchEntity = null;
            newAutorhsip.synchronize = null;
            return newAutorhsip;
        } else return a;
    });

    const newDocAuthorshipsData = authorshipsData.map(a => {
        if (!isSynchronizing(a)) {
            const newAutorhsip = _.cloneDeep(a);
            newAutorhsip.researchEntity = null;
            newAutorhsip.synchronize = null;
            return newAutorhsip;
        } else return a;
    });

    await Authorship.updateAuthorships(newDoc, newDocAuthorshipsData);
    await Authorship.updateAuthorships(doc, oldDocAuthorshipsData);

    return await Document.findOne({id: doc.id});
}


function getAuthorshipsToUpdate(docToUpdate, externalDocData, positionsToUpdate) {
    const verifiedPositions = docToUpdate.authorships.filter(a => a.researchEntity).map(a => a.position);
    return externalDocData.getFullAuthorships().reduce((acc, authorship) => {
        if (verifiedPositions.includes(authorship.position))
            return acc;

        if (positionsToUpdate.includes(authorship.position)) {
            const a = {
                authorStr: authorship.authorStr,
                position: authorship.position,
                affiliations: authorship.affiliations.map(af => af.institute),
                corresponding: authorship.corresponding
            };

            acc.push(a);
        }

        return acc;
    }, []);
}