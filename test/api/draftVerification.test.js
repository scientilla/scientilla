/* global User */

var should = require('should');
var test = require('./../helper.js');

describe('Draft Verification', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var user1Data = test.getAllUserData()[0];
    var user2Data = test.getAllUserData()[1];
    var documentData = test.getAllDocumentData()[0];
    var incompleteDocumentData = test.getAllDocumentData()[1];
    var nonexistentDocument =  {id: 1000};
    var user1;
    var user2;
    var user1Draft1;
    var user1Draft2;
    var user2Draft1;

    it('there should be no verified documents for a new user', function () {
        return test
                .registerUser(user1Data)
                .then(function (res) {
                    user1 = res.body;
                    return res;
                })
                .then(function (res) {
                    test
                            .getDocuments(user1)
                            .expect(200, []);
                });
    });

    it('verifying a complete draft should be possible', function () {
        return test
                .createDraft(user1, documentData)
                .then(function (res) {
                    user1Draft1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test.verifyDraft(user1, user1Draft1);
                })
                .then(function (res) {
                    return test
                            .getDrafts(user1)
                            .expect(200, []);
                })
                .then(function (res) {
                    return test
                            .getDocuments(user1, 'privateCoauthors')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var document = res.body[0];
                                document.title.should.equal(documentData.title);
                                document.draft.should.be.false;
                                should(document.draftCreator).be.null;
                                document.privateCoauthors.should.have.length(1);
                                document.privateCoauthors[0].username.should.equal(user1.username);
                            });
                });
    });

    it('verifying a complete draft twice should give an error', function () {
        return test
                .verifyDraft(user1, user1Draft1)
                .expect(400);
    });

    it('verifying a non complete draft should not be possible', function () {
        return test
                .createDraft(user1, incompleteDocumentData)
                .then(function (res) {
                    user1Draft2 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .verifyDraft(user1, user1Draft2)
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.draft.should.be.true;
                            });
                })
                .then(function (res) {
                    return test
                            .getDrafts(user1)
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                            });
                })
                .then(function (res) {
                    return test
                            .getDocuments(user1)
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                            });
                });
    });

    it('verifying a nonexsting document should give an error', function () {
        return test
                .verifyDraft(user1, nonexistentDocument)
                .expect(400);
    });

    it('verifying two identical documents should merge them', function () {
        return test.
                registerUser(user2Data)
                .then(function (res) {
                    user2 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .createDraft(user2, documentData)
                            .expect(200);
                })
                .then(function (res) {
                    user2Draft1 = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .verifyDraft(user2, user2Draft1)
                            .expect(200);
                })
                .then(function (res) {
                    return test
                            .getDocuments(user2, 'privateCoauthors')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var document = res.body[0];
                                document.id.should.equal(user1Draft1.id);
                                document.title.should.equal(documentData.title);
                                document.draft.should.be.false;
                                should(document.draftCreator).be.null;
                                document.privateCoauthors.should.have.length(2);
                                document.privateCoauthors[0].username.should.equal(user1.username);
                                document.privateCoauthors[1].username.should.equal(user2.username);
                            });
                });
    });

});