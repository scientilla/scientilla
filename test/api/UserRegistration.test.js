var should = require('should');
var assert = require('assert');
var request = require('supertest-as-promised');
var test = require('./../helper.js');

describe('User registration', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    var url = test.getUrl();
    var profile = {
        username: 'federico.bozzini@iit.it',
        password: 'userpass',
        name: 'Federico',
        lastName: 'Bozzini'
    };

    it('should be able to register new user when there is no users', function (done) {
        request(url)
                .get('/users')
                .expect(200, [])
                .then(function (res) {
                    return request(url)
                            .post('/auths/register')
                            .send(profile)
                            .expect(200);
                })
                .then(function (res) {
                    return request(url)
                            .get('/users')
                            .expect(function (res) {
                                res.status.should.equal(200);
                                res.body.should.have.length(1);
                                var newUser = res.body[0];
                                newUser.username.should.equal('federico.bozzini@iit.it');
                            });
                })
                .then(res => done())
                .catch(err => done(err));
    });

    it('should not be able to register a user with an already used username', function (done) {
        request(url)
                .post('/auths/register')
                .send(profile)
                .expect(400)
                .then(res => done())
                .catch(err => done(err));
    });

});