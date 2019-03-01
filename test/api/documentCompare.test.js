/* global User */
'use strict';

const should = require('should');
const helper = require('./../helper.js');
const _ = require('lodash');

/*
 * Steps for "Keep draft and mark all as not duplicates" & "Verify"
 *
 * 1: Create a user
 * 2: Create a group
 * 3: Create a institute
 * 4: Create a document source
 * 5: Create a draft document with created user & created document source
 * 6: Verify created draft document
 * 7: Create a second draft document with created user & created document source
 * 8: Verify created draft document
 * 9: Create a third draft document with created user & created document source
 *
 * 10: Mark the two verified documents as not duplicates of the third document
 * 11: Verify the third (not verified) document
 */

let createUser = function (expectedNumberOfUser) {
    return new Promise(resolve => {
        context('Try to add a new user.', function () {
            const users = helper.getAllUserData();

            it('Before creating a new user, check the number of the already created users. ' + (expectedNumberOfUser - 1) + ' user(s) found.', async () => {
                const body = await helper.getUsers();
                body.count.should.be.equal(expectedNumberOfUser - 1);
            });

            it('Should be able to register new user. ' + expectedNumberOfUser + ' user(s) found.', async () => {
                const user = await helper.registerUser(users[expectedNumberOfUser - 1]);
                const body = await helper.getUsers();

                // Check user
                body.count.should.be.equal(expectedNumberOfUser);
                // Check users arraybin/npm test
                body.items.should.have.length(expectedNumberOfUser);

                resolve(user);
            });
        });
    });
};

let createInstitute = function (expectedNumberOfInstitutes) {
    return new Promise(resolve => {
        context('Try to add a new institute.', function () {
            const institutes = helper.getAllInstituteData();

            it('Before creating a new institute, check the number of the already created institutes. ' + (expectedNumberOfInstitutes - 1) + ' institute(s) found.', async () => {
                const body = await helper.getInstitutes();
                body.count.should.be.equal(expectedNumberOfInstitutes - 1);
            });

            it('Should be able to create new institute. ' + expectedNumberOfInstitutes + ' institute(s) found.', async () => {
                const institute = await helper.createInstitute(institutes[expectedNumberOfInstitutes - 1]);
                const body = await helper.getInstitutes();

                // Check institute
                body.count.should.be.equal(expectedNumberOfInstitutes);
                // Check institutes array
                body.items.should.have.length(expectedNumberOfInstitutes);

                resolve(institute);
            });
        });
    });
};

let createSource = function (expectedNumberOfSources) {
    return new Promise(resolve => {
        context('Try to add a new source.', function () {
            const sources = helper.getAllSourceData();

            it('Before creating a new source, check the number of the already created sources. ' + (expectedNumberOfSources - 1) + ' source(s) found.', async () => {
                const body = await helper.getSources();
                body.count.should.be.equal(expectedNumberOfSources - 1);
            });

            it('Should be able to create new source. ' + expectedNumberOfSources + ' source(s) found.', async () => {
                const source = await helper.createSource(sources[expectedNumberOfSources - 1]);
                const body = await helper.getSources();

                // Check source
                body.count.should.be.equal(expectedNumberOfSources);
                // Check sources array
                body.items.should.have.length(expectedNumberOfSources);

                resolve(source);
            });
        });
    });
};

let createDraft = function (user, source, expectedNumberOfDrafts, removeScopusId = false) {
    return new Promise(resolve => {
        context('Try to add a new draft.', function () {
            let draft;
            const documents = helper.getAllDocumentData();

            it('Before creating a new draft, check the number of the already created drafts. ' + (expectedNumberOfDrafts - 1) + ' draft(s) found.', async () => {
                const body = await helper.getUserDrafts(user);
                body.count.should.be.equal(expectedNumberOfDrafts - 1);
            });

            it('Should be able to create new draft. ' + expectedNumberOfDrafts + ' draft(s) found.', async () => {
                const documentData = documents[expectedNumberOfDrafts - 1];
                documentData.source = source;
                if (removeScopusId) {
                    documentData.scopusId = '';
                }

                const draft = await helper.userCreateDraft(user, documentData);
                const body = await helper.getUserDrafts(user);

                // Check draft
                body.count.should.be.equal(expectedNumberOfDrafts);
                // Check draft array
                body.items.should.have.length(expectedNumberOfDrafts);

                resolve(draft);
            });
        });
    });
};

let verifyDraft = function (user, draft, position, affiliations) {
    return new Promise(resolve => {
        context('Try to verify a draft.', function () {
            let document;

            it('Before verifying the draft. Try to find it. 1 draft found.', async () => {
                const documents = await helper.getUserDraft(user, draft);
                documents.length.should.be.equal(1);
                document = documents[0];
            });

            it('The Id of the draft should be equal', async () => {
                document.id.should.be.equal(draft.id);
            });

            it('Verify draft: failed: position is not valid', async () => {
                document = await helper.userVerifyDraft(user, draft, 10, affiliations);
                document.error.should.be.equal('Document Verify fail: position not valid');
            });

            it('Verify draft: failed: affiliation or position not specified', async () => {
                document = await helper.userVerifyDraft(user, draft, position, []);
                document.error.should.be.equal('Document Verify fail: affiliation or position not specified');
            });

            it('Verify draft: successful', async () => {
                document = await helper.userVerifyDraft(user, draft, position, affiliations);
                document.kind.should.be.equal('v');
                resolve(document);
            });
        });
    });
};

let verifyDuplicate = function (user, draft, position, affiliations) {
    return new Promise(resolve => {
        context('Try to verify a duplicate draft.', function () {
            let document;

            it('Before verifying the duplicate. Try to find it. 1 draft found.', async () => {
                const documents = await helper.getUserDraft(user, draft);
                documents.length.should.be.equal(1);
                document = documents[0];
            });

            it('The Id of the draft should be equal', () => {
                document.id.should.be.equal(draft.id);
            });

            it('Verify draft: failed: Documents must be compared', async () => {
                document = await helper.userVerifyDraft(user, draft, position, affiliations);
                document.error.should.be.equal('Documents must be compared');
                resolve(document);
            });
        });
    });
};

let markAllAsNotDuplicates = function (user, document, duplicates) {
    return new Promise(resolve => {
        context('Try to mark all as not duplicates', function () {
            it('The amount of not duplicate records are the same as the given duplicates: ' + duplicates.length, async () => {
                const notDuplicates = await helper.userMarkAllAsNotDuplicates(user, document, duplicates);
                notDuplicates.length.should.be.equal(duplicates.length);
                resolve(notDuplicates);
            });
        });
    });
};

let getDraftWithDuplicates = function (user, draftData, expectedDuplicates) {
    return new Promise(async (resolve) => {
        describe('Try to get the draft with duplicates', async function () {
            let draft;

            it('One draft found', async () => {
                draft = await helper.getUserDraft(user, draftData, ['duplicates']);;
                draft.length.should.be.equal(1);
            });

            it('Expected duplicates are equal', () => {
                draft[0].duplicates.length.should.be.equal(expectedDuplicates);
                resolve(draft[0]);
            });
        });
    });
};

/*describe.only('Document Compare: two documents', async() => {
    before(helper.clean);

    // Create a user
    let user = await createUser(1);

    // Create an institute
    let iit = await createInstitute(1);

    // Create a source
    let source = await createSource(1);

    // Create a draft
    let document = await createDraft(user, source, 1);

    // Verify the draft
    document = await verifyDraft(user, document, 1, [iit.id]);

    // Create a new draft with the same data => duplicate but remove scopusId
    let duplicate = await createDraft(user, source, 1, true);

    // Verify the duplicate
    await verifyDuplicate(user, duplicate, 1, [iit.id]);

    // Keep and mark as not duplicate
    await markAllAsNotDuplicates(user, duplicate.id, [document.id]);

    // Verify the duplicate draft
    duplicate = await verifyDraft(user, duplicate, 1, [iit.id]);
});*/

/*describe.only('Document Compare: three documents', async () => {
    before(helper.clean);

    const user = await createUser(1);

    // Create an institute
    const iit = await createInstitute(1);

    // Create a source
    const source = await createSource(1);

    // Create a document (draft)
    let document = await createDraft(user, source, 1);

    // Verify the draft
    document = await verifyDraft(user, document, 1, [iit.id]);

    // Create a duplicate: a draft with the same data
    let duplicate1 = await createDraft(user, source, 1, true);

    // Mark as not duplicate (document & duplicate1)
    await markAllAsNotDuplicates(user, duplicate1.id, [document.id]);

    // Verify duplicate 1 draft
    await verifyDraft(user, duplicate1, 1, [iit.id]);

    // Create second source 2
    const source2 = await createSource(2);

    // Create a second duplicate: a draft with the same data
    let duplicate2 = await createDraft(user, source2, 1, true);

    // Get the draft to populate the duplicates
    duplicate2 = await getDraftWithDuplicates(user, duplicate2, 2);

    const duplicateIds = duplicate2.duplicates.map((duplicate) => {
        return duplicate.duplicate;
    });

    // Mark as not duplicate (document & duplicate2)
    await markAllAsNotDuplicates(user, duplicate2.id, duplicateIds);

    // Verify duplicate 2 draft
    duplicate2 = await verifyDraft(user, duplicate2, 1, [iit.id]);
});*/