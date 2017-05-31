/* global User */

'use strict';

const test = require('./../helper.js');

describe('Draft Deletion: ', () => {
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

    it('it should be possible to delete multiple drafts', async() => {
        user = await test.registerUser(usersData[0]);
        iitGroup = await test.createGroup(iitGroupData);
        const d1 = await test.groupCreateDraft(iitGroup, draftsData[0]);
        const d2 = await test.groupCreateDraft(iitGroup, draftsData[1]);
        const draftIds = [d1.id, d2.id];
        await test.groupDeleteDrafts(iitGroup, draftIds);
        await test.getGroupDrafts(iitGroup);

        const body = await test.getGroupDrafts(iitGroup);
        body.should.be.eql(test.EMPTY_RES);
    });

});
