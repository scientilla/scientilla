// Synchronizer.js - in api/services

const _ = require('lodash');

"use strict";

module.exports = {
    synchronizeScopus
};

async function synchronizeScopus() {
    sails.log.info("Scopus synchronization starting");
    const documentSynchronized = [];
    const documentsToSynchronize = await Document.find({
        editedAfterImport: false,
        kind: [DocumentKinds.DRAFT, DocumentKinds.VERIFIED],
        origin: DocumentOrigins.SCOPUS
    });
    sails.log.info(documentsToSynchronize.length + " documents found");
    for (let doc of documentsToSynchronize) {
        const externalDoc = await Document.findOne({
            scopusId: doc.scopusId,
            kind: DocumentKinds.EXTERNAL,
            origin: DocumentOrigins.SCOPUS
        });
        if (!externalDoc) {
            sails.log.debug('Document with id ' + doc.id + " has no corresponding external document");
            continue;
        }
        const docData = Document.selectData(doc);
        const externalDocData = Document.selectData(externalDoc);
        const differences = getDifferences(docData, externalDocData);
        if (_.isEmpty(differences)) {
            continue;
        }
        documentSynchronized.push(docData);
        delete externalDocData.kind;
        delete docData.kind;
        await Document.update(doc.id, externalDocData);
    }
    sails.log.info(documentSynchronized.length + " documents synchronized");
}


function getDifferences(d1, d2) {
    if (d1.kind == DocumentKinds.EXTERNAL || d2.kind != DocumentKinds.EXTERNAL)
        throw new Error('wrong method call');
    const documentFields = Document.getFields();
    _.remove(documentFields, f => f == 'kind');
    const differences = _.pickBy(d2, (v, k) => documentFields.includes(k) && v != d1[k]);
    return differences;
}