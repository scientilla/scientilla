/* global User */

'use strict';

var test = require('./../helper.js');

describe('Draft creation', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var userData = test.getAllUserData()[0];
    var draftData = test.getAllDocumentData()[0];
    var user;
    var draft;
    let authorship;
    let affiliation;

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
            .createDraft(user, draftData)
            .expect(200)
            .then(function (res) {
                draft = res.body;
                return res;
            })
            .then(function (res) {
                return test
                    .getDrafts(user)
                    .expect(function (res) {
                        res.status.should.equal(200);
                        res.body.should.have.length(1);
                        var d = res.body[0];
                        d.title.should.equal(draftData.title);
                        d.draft.should.be.true;
                        d.draftCreator.should.equal(user.id);
                    });
            });
    });
});
