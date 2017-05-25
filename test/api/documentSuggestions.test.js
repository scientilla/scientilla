/* global User */
'use strict';

const should = require('should');
const test = require('./../helper.js');

describe('Document Suggestions', () => {
    before(test.clean);
    after(test.clean);

    const user1Data = test.getAllUserData()[0];
    const user2Data = test.getAllUserData()[1];
    const user3Data = test.getAllUserData()[2];
    const documentData = test.getAllDocumentData()[0];
    const sourcesData = test.getAllSourceData();
    const groupsData = test.getAllGroupData();
    const institutesData = test.getAllInstituteData();
    const iitInstituteData = institutesData[0];
    const iitGroupData = groupsData[0];
    let user1;
    let user2;
    let user3;
    let document;
    let journal;
    let iitGroup;
    const user1Doc1Position = 4;
    const user2Doc1Position = 0;
    let iitInstitute;

    it('it should suggest the document to the user whose surname is among the authors (str)', async() => {
        user1 = await test.registerUser(user1Data);
        iitGroup = await test.createGroup(iitGroupData);
        iitInstitute = await test.createInstitute(iitInstituteData);
        journal = await test.createSource(sourcesData[0]);
        documentData.source = journal;
        document = await test.userCreateDraft(user1, documentData);
        const affiliations = [iitInstitute.id];
        await test.userVerifyDraft(user1, document, user1Doc1Position, affiliations, true);
        user2 = await test.registerUser(user2Data);
        const body = await test.getUserSuggestedDocuments(user2);
        // expect
        body.items.should.have.length(1);
        const d = body.items[0];
        d.id.should.equal(document.id);
    });

    it('after the user verifies the document, it should not be suggested anymore', async() => {
        const affiliations = [iitInstitute.id];
        await test.userVerifyDocument(user2, document, user2Doc1Position, affiliations);
        const body = await test.getUserSuggestedDocuments(user2);
        body.should.be.eql(test.EMPTY_RES);
    });

    it('if the surname of the user is not included in the author string, the document is not suggested', async () => {
        user3 = await test.registerUser(user3Data);
        const body = await test.getUserSuggestedDocuments(user3);
        body.should.be.eql(test.EMPTY_RES);
    });
});