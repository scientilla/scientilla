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
    var iitInstituteData = test.getAllInstituteData()[0];
    var unigeInstituteData = test.getAllInstituteData()[1];
    var nonExistentDocument =  {id: 1000};
    var user1;
    var user2;
    var user1Draft1;
    var user1Draft2;
    var user2Draft1;
    var user1Doc1Position = 4;
    var user2Doc1Position = 0;
    var iitInstitute;
    var unigeInstitute;

    it('there should be no verified documents for a new user', function () {
        return test
            .registerUser(user1Data)
            .then(function (res) {
                user1 = res.body;
                return res;
            })
            .then(function (res) {
                return test.createInstitute(iitInstituteData);
            })
            .then(function (res) {
                iitInstitute = res.body;
                return res;
            })
            .then(function (res) {
                return test.createInstitute(unigeInstituteData);
            })
            .then(function (res) {
                unigeInstitute = res.body;
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
                const affiliations = [iitInstitute.id];
                return test
                    .verifyDraft(user1, user1Draft1, user1Doc1Position, affiliations)
                    .expect(function (res) {
                        res.status.should.equal(200);
                        var document = res.body;
                        document.title.should.equal(documentData.title);
                        document.draft.should.be.false;
                        should(document.draftCreator).be.null;
                    });
            })
            .then(function (res) {
                return test
                    .getDrafts(user1)
                    .expect(200, []);
            })
            .then(function (res) {
                return test
                    .getDocumentsWithAuthors(user1)
                    .expect(function (res) {
                        res.status.should.equal(200);
                        res.body.should.have.length(1);
                        var document = res.body[0];
                        document.title.should.equal(documentData.title);
                        document.draft.should.be.false;
                        should(document.draftCreator).be.null;
                        document.authors.should.have.length(1);
                        document.authors[0].username.should.equal(user1.username);
                        document.authorships.should.have.length(1);
                        document.authorships[0].position.should.equal(user1Doc1Position);
                        document.affiliations.should.have.length(1);
                        document.affiliations[0].institute.should.equal(iitInstitute.id);
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
            .verifyDraft(user1, nonExistentDocument)
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
                    .verifyDraft(user2, user2Draft1, user2Doc1Position, [iitInstitute.id, unigeInstitute.id])
                    .expect(function (res) {
                    res.status.should.equal(200);
                    var document = res.body;
                    document.title.should.equal(documentData.title);
                    document.draft.should.be.false;
                    should(document.draftCreator).be.null;
                });
            })
            .then(function (res) {
                return test
                    .getDocumentsWithAuthors(user2)
                    .expect(function (res) {
                        res.status.should.equal(200);
                        res.body.should.have.length(1);
                        var document = res.body[0];
                        document.id.should.equal(user1Draft1.id);
                        document.title.should.equal(documentData.title);
                        document.draft.should.be.false;
                        should(document.draftCreator).be.null;
                        document.authors[0].username.should.equal(user1.username);
                        document.authors[1].username.should.equal(user2.username);
                        document.authorships.should.have.length(2);
                        document.authorships[0].position.should.equal(user1Doc1Position);
                        document.authorships[1].position.should.equal(user2Doc1Position);
                        document.affiliations.should.have.length(3);
                        document.affiliations[0].institute.should.equal(iitInstitute.id);
                        document.affiliations[1].institute.should.equal(iitInstitute.id);
                        document.affiliations[2].institute.should.equal(unigeInstitute.id);
                    });
            });
    });

});