/* global User */
'use strict';

const should = require('should');
const test = require('./../helper.js');

describe('Draft Unverification', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const user1Data = test.getAllUserData()[0];
    const user2Data = test.getAllUserData()[1];
    const documentData = test.getAllDocumentData()[0];
    let user1;
    let user2;
    let document;

    it('it should be possible to unverify a document', () =>
        test.registerUser(user1Data)
            .then(res => user1 = res.body)
            .then(res =>test.userCreateDraft(user1, documentData))
            .then(res => document = res.body)
            .then(res =>test.userVerifyDraft(user1, document))
            .then(res => test.registerUser(user2Data))
            .then(res => user2 = res.body)
            .then(res =>test.userVerifyDocument(user2, document))
            .then(res => test.userUnverifyDocument(user1, document)
                .expect(200))
            .then(res => test.getUserDocuments(user1)
                .expect(200, []))
            .then(res => test.getUserDrafts(user1)
                .expect(200, []))
            .then(res => test.getUserDocumentsWithAuthors(user2)
                .expect(res => {
                    res.status.should.equal(200);
                    res.body.should.have.length(1);
                    const document = res.body[0];
                    document.authors.should.have.length(1);
                    document.authors[0].username.should.equal(user2.username);
                })
            )
    );

    it('a document unverified by all the authors should be deleted', () =>
        test.userUnverifyDocument(user2, document)
            .expect(200)
            .then(res => test.getUserDrafts(user2)
                .send(documentData)
                .expect(200))
            .then(res => test.getUserDocuments(user2)
                .expect(200, []))
            .then(res => test.getDocument(document.id)
                .expect(404))
    );

});