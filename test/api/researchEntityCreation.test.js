/* global require, it, describe, before */

'use strict';

const test = require('./../helper.js');

describe('Research Entity Creation: ', () => {
    before(test.clean);

    const usersData = test.getAllUserData();
    const groupsData = test.getAllGroupData();

    let user;
    let group;
    const researchEntities = [];

    it('there should be a research entity for a new user', async () => {
        user = await test.registerUser(usersData[0]);
        const researchEntity = await test.researchEntity.getByUser(user);
        researchEntities.push(researchEntity);
        researchEntity.id.should.be.greaterThan(0);
    });

    it('there should be a research entity for a new group', async () => {
        group = await test.createGroup(groupsData[0]);
        const researchEntity = await test.researchEntity.getByGroup(user);
        researchEntities.push(researchEntity);
        researchEntity.id.should.be.greaterThan(0);
    });

    it('there should be no item drafts for a new research entity', async () => {
        const re = researchEntities[0];
        const drafts = await test.researchEntity.getItemDrafts(re);
        drafts.length.should.be.eql(0);
    });

});
