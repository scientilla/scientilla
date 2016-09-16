/* global User */

var should = require('should');
var assert = require('assert');
var request = require('supertest-as-promised');
var test = require('./../helper.js');

describe('Draft creation', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var url = test.getUrl();
    var userData = test.getUsers()[0];
    var documentData = test.getDocuments()[0];
    var user;

    it('there should be no drafts for a new user', function (done) {
        request(url)
                .get('/users')
                .expect(200, [])
                .then(function (res) {
                    return request(url)
                            .post('/auths/register')
                            .send(userData)
                            .expect(200);
                })
                .then(function (res) {
                    user = res.body;
                    return res;
                })
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user.id + '/drafts')
                            .expect(200, []);
                })
                .then(_ => done())
                .catch(done);
    });

    it('creating draft should be possible', function (done) {
        return request(url)
                .post('/users/' + user.id + '/drafts')
                .send(documentData)
                .expect(200)
                .then(function (res) {
                    return request(url)
                            .get('/users/' + user.id + '/drafts')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var draft = res.body[0];
                                draft.title.should.equal(documentData.title);
                                draft.draft.should.be.true;
                                draft.draftCreator.should.equal(user.id);
                            });
                })
                .then(_ => done())
                .catch(done);
    });

});