/* global User */
'use strict';

const should = require('should');
const test = require('./../helper.js');
const _ = require('lodash');

describe('Document Verification', () => {
    before(test.clean);
    after(test.clean);

    const user1Data = test.getAllUserData()[0];
    const user2Data = test.getAllUserData()[1];
    const documentData = test.getAllDocumentData()[0];
    const iitInstituteData = test.getAllInstituteData()[0];
    const unigeInstituteData = test.getAllInstituteData()[1];
    const groupsData = test.getAllGroupData();
    const journalData = test.getAllSourceData()[0];
    const iitGroupData = groupsData[0];
    let user1;
    let user2;
    let document;
    let journal;
    const user1Doc1position = 4;
    const user2Doc1position = 0;
    let iitInstitute;
    let unigeInstitute;
    let iitGroup;
    let author2affiliationInstitutes;


    it('it should be possible to verify an already verified document', async () => {
        user1 = await test.registerUser(user1Data);
        iitGroup = await test.createGroup(iitGroupData);
        iitInstitute = await test.createInstitute(iitInstituteData);
        unigeInstitute = await test.createInstitute(unigeInstituteData);
        journal = await test.createSource(journalData);
        documentData.source = journal;
        document = await test.userCreateDraft(user1, documentData);
        await test.userVerifyDraft(user1, document, user1Doc1position, [iitInstitute.id]);
        user2 = await test.registerUser(user2Data);
        author2affiliationInstitutes = [unigeInstitute.id, iitInstitute.id];
        await test.userVerifyDocument(user2, document, user2Doc1position, author2affiliationInstitutes);
        const body = await test.getUserDocumentsWithAuthors(user2);
        // expect
        const count = body.count;
        const documents = body.items;
        count.should.be.equal(1);
        documents.should.have.length(1);
        const d = documents[0];
        d.id.should.equal(document.id);
        d.title.should.equal(documentData.title);
        d.kind.should.be.equal('v');
        should(d.draftCreator).be.null;
        d.authors.should.have.length(2);
        d.authors[0].username.should.equal(user1.username);
        d.authors[1].username.should.equal(user2.username);
        d.authorships.should.have.length(2);
        d.authorships[0].position.should.equal(user1Doc1position);
        d.authorships[1].position.should.equal(user2Doc1position);
        d.affiliations.should.have.length(3);
        d.affiliations[0].institute.should.equal(iitInstitute.id);
        const author2affiliations = d.affiliations.filter(a => a.authorship === d.authorships[1].id);
        const author2affiliationInstitutesActual = _.map(author2affiliations, 'institute');
        author2affiliationInstitutesActual.should.containDeep(author2affiliationInstitutes);
    });
});