/* global User */
'use strict';

const should = require('should');
const test = require('./../helper.js');
const _ = require('lodash');

describe('Document Verification', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const user1Data = test.getAllUserData()[0];
    const user2Data = test.getAllUserData()[1];
    const documentData = test.getAllDocumentData()[0];
    const iitInstituteData = test.getAllInstituteData()[0];
    const unigeInstituteData = test.getAllInstituteData()[1];
    const journalData = test.getAllSourceData()[0];
    let user1;
    let user2;
    let document;
    let journal;
    const user1Doc1position = 4;
    const user2Doc1position = 0;
    let iitInstitute;
    let unigeInstitute;
    let author2affiliationInstitutes;


    it('it should be possible to verify an already verified document', () =>
        test.registerUser(user1Data)
            .then(res => user1 = res.body)
            .then(() => test.createInstitute(iitInstituteData))
            .then(res => iitInstitute = res.body)
            .then(() => test.createInstitute(unigeInstituteData))
            .then(res => unigeInstitute = res.body)
            .then(() => test.createSource(journalData))
            .then(res => journal = res.body)
            .then(() => {
                documentData.source = journal;
                return test.userCreateDraft(user1, documentData)
            })
            .then(res => document = res.body)
            .then(() => test.userVerifyDraft(user1, document, user1Doc1position, [iitInstitute.id]))
            .then(() => test.registerUser(user2Data))
            .then(res => user2 = res.body)
            .then(() => {
                author2affiliationInstitutes = [unigeInstitute.id, iitInstitute.id];
                return test
                    .userVerifyDocument(user2, document, user2Doc1position, author2affiliationInstitutes)
                    .expect(200);
            })
            .then(() => test
                .getUserDocumentsWithAuthors(user2)
                .expect(res => {
                    res.status.should.equal(200);
                    const count = res.body.count;
                    const documents = res.body.items;
                    count.should.be.equal(1);
                    documents.should.have.length(1);
                    const d = documents[0];
                    d.id.should.equal(document.id);
                    d.title.should.equal(documentData.title);
                    d.draft.should.be.false;
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
                })
            )
    );
});