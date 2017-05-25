/* global User */

'use strict';

var test = require('./../helper.js');

describe('Draft Bulk Creation: ', () => {
    before(test.clean);
    after(test.clean);

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData();
    const iitGroupData = test.getAllGroupData()[0];
    const iitInstituteData = test.getAllInstituteData()[0];
    let iitGroup;
    let user;

    it('creating multiple drafts should be possible for an user', async() => {
        user = await test.registerUser(usersData[0]);
        const draftsData = [documentsData[2], documentsData[3], documentsData[4]];
        iitGroup = await test.createGroup(iitGroupData);
        await test.createInstitute(iitInstituteData);
        await test.userCreateDrafts(user, draftsData);
        const body = await test.getUserDrafts(user);
        // expect
        const count = body.count;
        const documents = body.items;
        count.should.be.equal(3);
        documents.should.have.length(3);
    });

    it('creating multiple drafts should be possible for a group', async() => {
        const draftsData = [documentsData[0], documentsData[1], documentsData[2]];
        await test.groupCreateDrafts(iitGroup, draftsData);
        const body = await test.getGroupDrafts(iitGroup);
        // expect
        const count = body.count;
        const documents = body.items;
        count.should.be.equal(3);
        documents.should.have.length(3);
        checkDrafts(iitGroup, draftsData, documents);
    });


    function checkDrafts(researchEntity, draftsData, drafts) {
        drafts.forEach(draft => {
            draft.title.should.equalOneOf(draftsData.map(d => d.title));
            draft.kind.should.be.equal('d');
            if (draft.draftCreator)
                draft.draftCreator.should.equal(researchEntity.id);
            else
                draft.draftGroupCreator.should.equal(researchEntity.id);
        });
    }
});
