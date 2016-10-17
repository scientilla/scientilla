/* global User */

var should = require('should');
var test = require('./../helper.js');

describe('Document Verification', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var user1Data = test.getAllUserData()[0];
    var user2Data = test.getAllUserData()[1];
    var documentData = test.getAllDocumentData()[0];
    var user1;
    var user2;
    var document;
    var user1Doc1position = 4;
    var user2Doc1position = 0;

    it('it should be possible to verify an already verified document', function () {
        return test.registerUser(user1Data)
                .then(function (res) {
                    user1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test.createDraft(user1, documentData);
                })
                .then(function (res) {
                    document = res.body;
                    return res;
                })
                .then(function (res) {
                    return test.verifyDraft(user1, document, user1Doc1position);
                })
                .then(function (res) {
                    return test.registerUser(user2Data);
                })
                .then(function (res) {
                    user2 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .verifyDocument(user2, document, user2Doc1position)
                            .expect(200);
                })
                .then(function (res) {
                    return test
                            .getDocumentsWithAuthors(user2)
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var d = res.body[0];
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
                            });
                });
    });
});