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

    it('should be able to register new user when there is no users', async ()=> {
        iitInstitute = (await test.createInstitute(iitInstituteData)).body;
        iitGroup = (await test.createGroup(iitGroupData)).body;
        await test.registerUser(userData);
        await test
            .getUsers()
            .expect((res) => {
                res.status.should.equal(200);
                const count = res.body.count;
                const documents = res.body.items;
                count.should.be.equal(1);
                documents.should.have.length(1);
                const newUser = documents[0];
                newUser.username.should.equal(userData.username);
                newUser.role.should.equal(User.ADMINISTRATOR);
            });
    }
    );

    it('should not be able to register a user with an already used username', async () =>
        await test.registerUser(userData)
            .expect(400)
    );

});