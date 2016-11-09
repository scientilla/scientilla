/* global User */
'use strict';

const test = require('./../helper.js');

describe('User registration', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const userData = test.getAllUserData()[0];

    it('by default there should be no users', () =>
        test.getUsers()
            .expect(200, {count: 0, items: []})
    );

    it('should be able to register new user when there is no users', ()=>
        test.registerUser(userData)
            .then(function (res) {
                return test
                    .getUsers()
                    .expect(function (res) {
                        res.status.should.equal(200);
                        const count = res.body.count;
                        const documents = res.body.items;
                        count.should.be.equal(1);
                        documents.should.have.length(1);
                        const newUser = documents[0];
                        newUser.username.should.equal(userData.username);
                        newUser.role.should.equal(User.ADMINISTRATOR);
                    });
            })
    );

    it('should not be able to register a user with an already used username', () =>
        test.registerUser(userData)
            .expect(400)
    );

});