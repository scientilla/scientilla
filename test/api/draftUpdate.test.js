/* global User */

'use strict';

const test = require('./../helper.js');

describe('Draft Creation: ', () => {
    before(test.clean);
    after(test.clean);

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

    it('it should be possible to update a draft for a group', async() => {
        const newTitle = 'test';
        user = await test.registerUser(usersData[0]);
        iitGroup = await test.createGroup(iitGroupData);
        const groupDraft = await test.groupCreateDraft(iitGroup, draftsData[0]);
        groupDraft.title = newTitle;
        const groupDraftUpdated = await test.groupUpdateDraft(iitGroup, groupDraft);
        groupDraftUpdated.title.should.equal(newTitle);
        const body = await test.getGroupDrafts(iitGroup);
        const groupDrafts = body.items;
        groupDrafts.length.should.equal(1);
        groupDrafts[0].title.should.equal(newTitle);
    });

});
