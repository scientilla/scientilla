/* global User */

var test = require('./../helper.js');

describe('Draft creation', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var userData = test.getAllUserData()[0];
    var documentData = test.getAllDocumentData()[0];
    var user;

    it('there should be no drafts for a new user', function () {
        return test
                .registerUser(userData)
                .then(function (res) {
                    user = res.body;
                    return res;
                })
                .then(function (res) {
                    return test
                            .getDrafts(user)
                            .expect(200, []);
                });
    });

    it('creating draft should be possible', function () {
        return test
                .createDraft(user, documentData)
                .expect(200)
                .then(function (res) {
                    return test
                            .getDrafts(user)
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var draft = res.body[0];
                                draft.title.should.equal(documentData.title);
                                draft.draft.should.be.true;
                                draft.draftCreator.should.equal(user.id);
                            });
                });
    });

});