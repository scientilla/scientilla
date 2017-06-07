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
            .populate('authors')
            .populate('groups')
            .populate('authorships')
            .populate('groupAuthorships')
            .populate('affiliations')
            .populate('discarded')
            .populate('discardedG');
        if (Document.getNumberOfConnections(doc) == 0) {
            sails.log.warn(`Document with id ${doc.id} is a verified document but has no connections`);
            continue;
        }
        const errors = [];
        const copies = await Document.findCopies(doc);
        if (copies.length == 0)
            continue;
        const copy = copies[0];
        for (let d of doc.discarded) {
            const res = await User.undiscardDocument(User, d.researchEntity, d.document);
            if (res.error) {
                errors.push(res);
                sails.log.debug(`User ${a.researchEntity} was trying to remove ${doc.id} from the discarded but an error occured`);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            }
            await User.discardDocument(User, d.researchEntity, copy.id);
        }
        for (let d of doc.discardedG) {
            const res = await Group.undiscardDocument(Group, d.researchEntity, d.document);
            if (res.error) {
                sails.log.debug(`Group ${a.researchEntity} was trying to remove ${doc.id} from the discarded but an error occured`);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            }
            await Group.discardDocument(Group, d.researchEntity, copy.id);
        }
        for (let a of doc.authorships) {
            if (!a.researchEntity)
                continue;
            const instituteIds = doc.affiliations.filter(aff => aff.authorship == a.id).map(aff => aff.institute);
            sails.log.debug(`User ${a.researchEntity} is trying to verify document ${copy.id} (${copy.title}) in position: ${a.position}`);
            const res = await User.verifyDocument(User, a.researchEntity, copy.id, a.position, instituteIds, a.corresponding);
            if (res.error) {
                errors.push(res);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            } else {
                sails.log.debug(`User ${a.researchEntity} is trying to unverify document ${doc.id} (${doc.title})`);
                await User.unverifyDocument(User, a.researchEntity, doc.id);
            }
        }
        for (let a of doc.groupAuthorships) {
            if (!a.researchEntity)
                continue;
            sails.log.debug(`Group ${a.researchEntity} is trying to verify document ${copy.id} (${copy.title})`);
            const res = await Group.verifyDocument(Group, a.researchEntity, copy.id, null, null, null);
            if (res.error) {
                errors.push(res);
                sails.log.warn('Error: ');
                sails.log.warn(res.error);
            } else {
                sails.log.debug(`Group ${a.researchEntity} is trying to unverify document ${doc.id} (${doc.title})`);
                await Group.unverifyDocument(Group, a.researchEntity, doc.id);
            }
        }
        if (errors.length) {
            sails.log.debug(`Document ${doc.id} should have been merged with  ${copy.id} but an error occured`)
            nonMergedDocuments.push({doc: doc, copy: copy});
        }
        else {
            sails.log.debug(`Document ${doc.id} was merged with ${copy.id}`);
            mergedDocuments.push({doc: doc, copy: copy});
        }
    }
    sails.log.debug(`${mergedDocuments.length} documents merged`);
    sails.log.debug(`${nonMergedDocuments.length} documents were not merged because of some error`);
}