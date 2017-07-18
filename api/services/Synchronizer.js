/* global Document, sails, User, ObjectComparer, Authorship, DocumentKinds, ExternalImporter, DocumentOrigins, Synchronizer */
// Synchronizer.js - in api/services

const _ = require('lodash');

"use strict";

module.exports = {
    synchronizeScopus,
    documentSynchronizeScopus
};

const populates = [
    'authorships',
    'groupAuthorships',
    'affiliations'
];

async function synchronizeScopus() {
    sails.log.info("Scopus synchronization starting");
    const documentSynchronized = [];
    const documentsToSynchronize = await Document.find({
        synchronized: true,
        kind: [DocumentKinds.DRAFT, DocumentKinds.VERIFIED],
        origin: DocumentOrigins.SCOPUS
    }).populate(populates);
    sails.log.info(documentsToSynchronize.length + " documents found");
    for (let doc of documentsToSynchronize) {
        try {
            const res = await documentSynchronize(doc, DocumentOrigins.SCOPUS);
            if (!res.err)
                documentSynchronized.push(res.docData);
        }
        catch (e) {
            sails.log.debug(e);
        }
    }
    sails.log.info(documentSynchronized.length + " documents synchronized");
}

async function documentSynchronizeScopus(docId) {
    const doc = await Document.findOneById(docId).populate(populates);

    const externalDocument = await ExternalImporter.updateDocument(DocumentOrigins.SCOPUS, doc.scopusId);
    if (!_.has(externalDocument, 'id'))
        throw "ScopusId rejected by Scopus" + doc.scopusId;

    const res = await documentSynchronize(doc, DocumentOrigins.SCOPUS);
    if (res.err && res.code !== 1)
        throw "Synchronization failed " + doc.id;

    res.docData.synchronized = true;
    await Document.update(doc.id, res.docData);

    return res.docData;
}

/*
 * error codes:
 *   0 - No external found
 *   1 - No differences with external
 *   2 - All verified authorship have synchronize = false
 *
 */
async function documentSynchronize(doc, origin) {
    const externalDoc = await Document.findOne({
        scopusId: doc.scopusId,
        kind: DocumentKinds.EXTERNAL,
        origin: origin
    }).populate(populates);
    if (!externalDoc) {
        sails.log.debug('Document with id ' + doc.id + " has no corresponding external document");
        return {err: true, code: 0};
    }

    const docData = Document.selectData(doc);
    const externalDocData = Document.selectData(externalDoc);
    const differences = getDifferences(docData, externalDocData);
    checkAuthors(doc, externalDoc);
    const affiliationsHaveDiff = checkAffiliations(doc, externalDoc);

    if (_.isEmpty(differences) && !affiliationsHaveDiff)
        return {err: true, code: 1, docData};

    if (doc.kind === DocumentKinds.VERIFIED) {
        const splitRes = await documentSplit(doc);

        if (!splitRes)
            return {err: true, code: 2, docData};
    }

    await synchronizeAffiliations(doc, externalDoc);

    delete externalDocData.kind;
    delete externalDocData.synchronized;
    await Document.update(doc.id, externalDocData);

    return {
        err: false,
        docData: externalDocData
    };
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

function checkAffiliations(doc, externalDoc) {
    const docFullAuthorships = doc.getFullAuthorships();
    const externalFullAuthorships = externalDoc.getFullAuthorships();

    if (docFullAuthorships.length !== externalFullAuthorships.length)
        return true;

    let retValue = false;

    docFullAuthorships.forEach((authorship, i) => {
        const aff1 = authorship.affiliations.map(a => a.institute);
        const aff2 = externalFullAuthorships[i].affiliations.map(a => a.institute);

        if (aff1.length !== aff2.length)
            retValue = true;

        aff1.forEach((af, j) => {
            if (af !== aff2[j])
                retValue = true;
        });
    });

    return retValue;
}

async function documentSplit(doc) {
    //a.synchronize could be null
    const notSynchronizingAuthorships = doc.authorships.filter(a => a.synchronize === false);

    if (notSynchronizingAuthorships.length === doc.authorships.length)
        return false;
    if (!notSynchronizingAuthorships.length)
        return doc;

    const newDoc = await doc.clone({synchronized: false});

    const authorshipsData = doc.getFullAuthorships();
    const oldDocAuthorshipsData = authorshipsData.map(a => {
        if (!notSynchronizingAuthorships
                .map(nsa => nsa.researchEntity)
                .includes(a.researchEntity)) {
            const newAutorhsip = _.cloneDeep(a);
            a.researchEntity = null;
            a.synchronize = null;
            return newAutorhsip;
        }
        else return a;

    });
    const newDocAuthorshipsData = authorshipsData.map(a => {
        if (notSynchronizingAuthorships
                .map(nsa => nsa.researchEntity)
                .includes(a.researchEntity)) {
            const newAutorhsip = _.cloneDeep(a);
            a.researchEntity = null;
            a.synchronize = null;
            return newAutorhsip;
        }
        else return a;
    });
    await doc.setAuthorships(oldDocAuthorshipsData);
    await newDoc.setAuthorships(newDocAuthorshipsData);

    return true;
}

async function synchronizeAffiliations(doc, externalDoc) {
    const externalAuthorshipsData = externalDoc.getFullAuthorships();
    const authorshipsData = doc.getFullAuthorships();

    const newAuthorshipsData = [];
    externalAuthorshipsData.forEach(ea => {
        let newAuthorship;
        const authData = authorshipsData.find(a => a.position === ea.position);
        if (authData) {
            newAuthorship = _.cloneDeep(authData);
            newAuthorship.affiliations = _.cloneDeep(ea.affiliations);
        }
        else newAuthorship = _.cloneDeep(ea);
        newAuthorshipsData.push(newAuthorship);
    });
    await doc.setAuthorships(newAuthorshipsData);
}