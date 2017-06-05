// DocumentMerger.js - in api/services

const _ = require('lodash');

"use strict";

module.exports = {
    mergeDocuments
};

//missing check of discarded documents
async function mergeDocuments() {
    const mergedDocuments = [];
    const nonMergedDocuments = [];
    const documents = await Document.findByKind(DocumentKinds.VERIFIED)
        .populate('authorships')
        .populate('groupAuthorships')
        .populate('affiliations');
    sails.log.debug(`${documents.length} documents to check found`);

    for (let doc of documents) {
        const errors = [];
        const copies = await Document.findCopies(doc);
        if (copies.length == 0)
            continue;
        const copy = copies[0];
        for (let a of doc.authorships) {
            if (!a.researchEntity)
                continue;
             const instituteIds = doc.affiliations.filter(aff => aff.authorship == a.id).map(aff => aff.institute);
            const res = await User.verifyDocument(User, a.researchEntity, copy.id, a.position, instituteIds, a.corresponding);
            if (res.error) {
                errors.push(res);
                sails.log.debug(`Document with id ${doc.id} has authorship problem. User: ${a.researchEntity}, position: ${a.position}`);
            } else
                await User.unverifyDocument(User, a.researchEntity, doc.id);
        }
        for (let a of doc.groupAuthorships) {
            if (!a.researchEntity)
                continue;
            const res = await Group.verifyDocument(Group, a.researchEntity, copy.id, a.position, [], a.corresponding);
            if (res.error) {
                errors.push(res);
                sails.log.debug(`Document with id ${doc.id} has authorship problem. Group: ${a.researchEntity}, position: ${a.position}`);
            } else
                await Group.unverifyDocument(Group, a.researchEntity, doc.id);
        }
        if (errors.length)
            nonMergedDocuments.push(doc);
        else
            mergedDocuments.push(doc);
    }
    sails.log.debug(`${mergedDocuments.length} documents merged`);
    sails.log.debug(`${nonMergedDocuments.length} documents were not merged because of some error`);
}