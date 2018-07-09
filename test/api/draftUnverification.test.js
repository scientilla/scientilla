/* global User */
'use strict';

const should = require('should');
const test = require('./../helper.js');

describe('Draft Unverification', () => {
    before(test.clean);

    const user1Data = test.getAllUserData()[0];
    const user2Data = test.getAllUserData()[1];
    const documentData = test.getAllDocumentData()[0];
    const institutesData = test.getAllInstituteData();
    const groupsData = test.getAllGroupData();
    const iitInstituteData = institutesData[0];
    const sourcesData = test.getAllSourceData();
    const iitGroupData = groupsData[0];
    let user1;
    let user2;
    let document;
    let journal;
    let iitGroup;
    const user1Doc1Position = 4;
    const user2Doc1Position = 0;
    let iitInstitute;

    it('it should be possible to unverify a document', async () => {
        user1 = await test.registerUser(user1Data);
        iitGroup = await test.createGroup(iitGroupData);
        iitInstitute = await test.createInstitute(iitInstituteData);
        journal = await test.createSource(sourcesData[0]);
        documentData.source = journal;
        document = await test.userCreateDraft(user1, documentData);
        const affiliations = [iitInstitute.id];
        await test.userVerifyDraft(user1, document, user1Doc1Position, affiliations);
        user2 = await test.registerUser(user2Data);
        const affiliations2 = [iitInstitute.id];
        await test.userVerifyDocument(user2, document, user2Doc1Position, affiliations2);
        await test.userUnverifyDocument(user1, document);
        const userDocsBody = await test.getUserDocuments(user1);
        // expect
        userDocsBody.should.be.eql(test.EMPTY_RES);

        const userDraftsBody = await test.getUserDrafts(user1);
        // expect
        userDraftsBody.should.be.eql(test.EMPTY_RES);

        const body = await test.getUserDocumentsWithAuthors(user2);
        // expect
        body.items.should.have.length(1);
        const d = body.items[0];
        d.authors.should.have.length(1);
        d.authors[0].username.should.equal(user2.username);
    });

    it('a document unverified by all the authors should be deleted', async () => {
        await test.userUnverifyDocument(user2, document);
        const userDraftsBody = await test.getUserDrafts(user2);
        userDraftsBody.should.be.eql(test.EMPTY_RES);
        const userDocumentsBody = await test.getUserDocuments(user2);
        userDocumentsBody.should.be.eql(test.EMPTY_RES);
        await test.getDocument(document.id, 404);
    });

});