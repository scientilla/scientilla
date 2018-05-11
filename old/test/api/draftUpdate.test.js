/* global User */

'use strict';

const test = require('./../helper.js');
const should = require('should');

describe('Draft Creation: ', () => {
    before(test.clean);
    after(test.clean);

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData();
    const groupsData = test.getAllGroupData();
    const institutesData = test.getAllInstituteData();
    const sourcesData = test.getAllSourceData();
    const iitInstituteData = institutesData[0];
    const iitGroupData = groupsData[0];
    let iitInstitute;
    let iitGroup;

    const draftsData = [documentsData[0], documentsData[1]];

    let user, group, groupDraft, journal;

    it('it should be possible to update a draft for a group', async() => {
        const newTitle = 'test';
        user = await test.registerUser(usersData[0]);
        journal = await test.createSource(sourcesData[0]);
        iitGroup = await test.createGroup(iitGroupData);
        draftsData[0].source = journal;
        groupDraft = await test.groupCreateDraft(iitGroup, draftsData[0]);
        groupDraft.title = newTitle;
        groupDraft = await test.groupUpdateDraft(iitGroup, groupDraft);
        groupDraft.title.should.equal(newTitle);
        const body = await test.getGroupDrafts(iitGroup);
        const groupDrafts = body.items;
        groupDrafts.length.should.equal(1);
        groupDrafts[0].title.should.equal(newTitle);
    });

    it('if an invalid source is passed, it should be ignored with an error', async() => {
        groupDraft.source = 'invaild';
        await test.groupUpdateDraft(iitGroup, groupDraft, 400);
        groupDraft = await test.getDocument(groupDraft.id);
        groupDraft.source.should.equal(journal.id);
    });

});
