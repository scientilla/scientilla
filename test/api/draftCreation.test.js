/* global User */

'use strict';

const test = require('./../helper.js');

describe('Draft Creation: ', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData();
    const groupsData = test.getAllGroupData();
    const institutesData = test.getAllInstituteData();
    const iitInstituteData = institutesData[0];
    const iitGroupData = groupsData[0];
    let iitInstitute;
    let iitGroup;

    const draftsData = [documentsData[0], documentsData[1]];

    let user;
    let group;

    it('there should be no drafts for a new user', async() => {
        iitGroup = await test.createGroup(iitGroupData);
        user = await test.registerUser(usersData[0]);
        const body = await test.getUserDrafts(user);
        body.should.be.eql(test.EMPTY_RES);
    });

    it('creating user draft should be possible', async() => {
        await test.userCreateDraft(user, draftsData[0]);
        const body = await test.getUserDrafts(user);
        //expect
        const count = body.count;
        const drafts = body.items;
        count.should.be.equal(1);
        drafts.should.have.length(1);
        checkDraft(user, draftsData[0], drafts[0]);
    });

    it('there should be no drafts for a new group', async() => {
        group = await test.createGroup(groupsData[0]);
        const body = await test.getGroupDrafts(group);
        //expect
        body.should.be.eql(test.EMPTY_RES);
    });

    it('creating group draft should be possible', async() => {
        await test.groupCreateDraft(group, draftsData[1]);
        const body = await test.getGroupDrafts(group);
        // expect
        const count = body.count;
        const drafts = body.items;
        count.should.be.equal(1);
        drafts.should.have.length(1);
        checkDraft(group, draftsData[1], drafts[0]);
    });

    function checkDraft(researchEntity, draftData, draft) {
        draft.title.should.equal(draftData.title);
        draft.draft.should.be.true;
        if (draft.draftCreator)
            draft.draftCreator.should.equal(researchEntity.id);
        else
            draft.draftGroupCreator.should.equal(researchEntity.id);
    }

});
