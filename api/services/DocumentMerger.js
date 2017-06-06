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
    const documents = await Document.findByKind(DocumentKinds.VERIFIED);
    sails.log.debug(`${documents.length} documents to check found`);

    for (let partialDoc of documents) {
        const doc = await Document.findOneById(partialDoc.id)
            .populate('authorships')
            .populate('groupAuthorships')
            .populate('affiliations')
            .populate('discarded')
            .populate('discardedG');
        if (doc.authorships.length == 0 && doc.groupAuthorships.length == 0) {
            sails.log.warn(`Document with id ${doc.id} is a verified document but has no authorships`);
            continue;
        }
        const errors = [];
        const copies = await Document.findCopies(doc);
        if (copies.length == 0)
            continue;
        const copy = copies[0];
        for (let d of doc.discarded) {
            await Discarded.destroy({id: d.id});
            await User.discardDocument(d.researchEntity, d.document);
        }
        for (let d of doc.discardedG) {
            await Discarded.destroy({id: d.id});
            await Group.discardDocument(d.researchEntity, d.document);
        }
        for (let a of doc.authorships) {
            if (!a.researchEntity)
                continue;
            const instituteIds = doc.affiliations.filter(aff => aff.authorship == a.id).map(aff => aff.institute);
            const res = await User.verifyDocument(User, a.researchEntity, copy.id, a.position, instituteIds, a.corresponding);
            if (res.error) {
                errors.push(res);
                sails.log.warn(`User ${a.researchEntity} was trying to unverify document ${doc.id} and verify document ${copy.id} (${doc.title}) in position: ${a.position}, but an error occured`);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            } else
                await User.unverifyDocument(User, a.researchEntity, doc.id);
        }
        for (let a of doc.groupAuthorships) {
            if (!a.researchEntity)
                continue;
            const res = await Group.verifyDocument(Group, a.researchEntity, copy.id, null, null, null);
            if (res.error) {
                errors.push(res);
                sails.log.warn(`Group ${a.researchEntity} was trying to unverify document ${doc.id} and verify document ${copy.id} (${doc.title}), but an error occured`);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
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