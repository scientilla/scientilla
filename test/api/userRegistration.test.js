/* global User */
'use strict';

const test = require('./../helper.js');

describe('User registration', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const userData = test.getAllUserData()[0];
    const institutesData = test.getAllInstituteData();
    const groupsData = test.getAllGroupData();
    const iitInstituteData = institutesData[0];
    const iitGroupData = groupsData[0];
    let iitInstitute;
    let iitGroup;

    it('by default there should be no users', () =>
        test.getUsers()
            .expect(200, test.EMPTY_RES)
    );

    it('should be able to register new user when there is no users', ()=>
        Promise.resolve()
            .then(() => test.createInstitute(iitInstituteData))
            .then(res => iitInstitute = res.body)
            .then(() => test.createGroup(iitGroupData))
            .then(res => iitGroup = res.body)
            .then(() => test.registerUser(userData))
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