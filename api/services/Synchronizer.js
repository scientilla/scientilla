// Synchronizer.js - in api/services

"use strict";

module.exports = {
    synchronizeScopus
};

async function synchronizeScopus() {
    sails.log.info("Scopus synchronization starting");
    const documentsToSynchronize = await Document.find({
        editedAfterImport: false,
        kind: [DocumentKinds.DRAFT, DocumentKinds.VERIFIED],
        origin: DocumentOrigins.SCOPUS
    });
    for (let doc of documentsToSynchronize) {
        const externalDoc = await Document.findOne({
            scopusId: doc.scopusId,
            kind: DocumentKinds.EXTERNAL,
            origin: DocumentOrigins.SCOPUS
        });
        const externalDocData = Document.selectData(externalDoc);
        delete externalDocData.kind;
        const d = await Document.update(doc.id, externalDocData);
    }
    sails.log.info(documentsToSynchronize.length + " documents synchronized");
}