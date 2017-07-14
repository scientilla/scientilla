// Synchronizer.js - in api/services

const _ = require('lodash');

"use strict";

module.exports = {
    synchronizeScopus,
    documentSynchronizeScopus
};

async function synchronizeScopus() {
    sails.log.info("Scopus synchronization starting");
    const documentSynchronized = [];
    const documentsToSynchronize = await Document.find({
        synchronized: true,
        kind: [DocumentKinds.DRAFT, DocumentKinds.VERIFIED],
        origin: DocumentOrigins.SCOPUS
    });
    sails.log.info(documentsToSynchronize.length + " documents found");
    for (let doc of documentsToSynchronize) {
        const res = await documentSynchronizeScopus(doc);
        if (!res.err)
            documentSynchronized.push(res.docData);
    }
    sails.log.info(documentSynchronized.length + " documents synchronized");
}


async function documentSynchronizeScopus(doc) {
    const externalDoc = await Document.findOne({
        scopusId: doc.scopusId,
        kind: DocumentKinds.EXTERNAL,
        origin: DocumentOrigins.SCOPUS
    });
    if (!externalDoc) {
        sails.log.debug('Document with id ' + doc.id + " has no corresponding external document");
        return {err: true, code: 0};
    }
    const docData = Document.selectData(doc);
    const externalDocData = Document.selectData(externalDoc);
    const differences = getDifferences(docData, externalDocData);
    if (_.isEmpty(differences))
        return {
            err: true,
            code: 1,
            docData
        };

    delete externalDocData.kind;
    delete docData.kind;
    await Document.update(doc.id, externalDocData);

    return {
        err: false,
        docData: externalDocData
    };
}


function getDifferences(d1, d2) {
    if (d1.kind == DocumentKinds.EXTERNAL || d2.kind != DocumentKinds.EXTERNAL)
        throw new Error('wrong method call');
    const documentFields = Document.getFields();
    _.remove(documentFields, f => f == 'kind');
    const differences = _.pickBy(d2, (v, k) => documentFields.includes(k) && v != d1[k]);
    return differences;
}