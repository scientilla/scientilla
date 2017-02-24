/* global User */

'use strict';

var test = require('./../helper.js');

describe('Draft Bulk Creation: ', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData();
    const iitGroupData = test.getAllGroupData()[0];
    const iitInstituteData = test.getAllInstituteData()[0];
    let iitGroup;
    let user;

    it('creating multiple drafts should be possible for an user', async() => {
        const draftsData = [documentsData[2], documentsData[3], documentsData[4]];
        iitGroup = (await test.createGroup(iitGroupData)).body;
        await test.createInstitute(iitInstituteData);
        user = (await test.registerUser(usersData[0])).body;
        await test
            .userCreateDrafts(user, draftsData)
            .expect(200);
        await test
            .getUserDrafts(user)
            .expect(res => {
                res.status.should.equal(200);
                const count = res.body.count;
                const documents = res.body.items;
                count.should.be.equal(3);
                documents.should.have.length(3);
                checkDrafts(user, draftsData, documents);
            });
    });

    it('creating multiple drafts should be possible for a group', async() => {
        const draftsData = [documentsData[0], documentsData[1], documentsData[2]];
        await test.groupCreateDrafts(iitGroup, draftsData)
        await test
            .getGroupDrafts(iitGroup)
            .expect(res => {
                res.status.should.equal(200);
                const count = res.body.count;
                const documents = res.body.items;
                count.should.be.equal(3);
                documents.should.have.length(3);
                checkDrafts(iitGroup, draftsData, documents);
            });
    });


    function checkDrafts(researchEntity, draftsData, drafts) {
        drafts.forEach(draft => {
            draft.title.should.equalOneOf(draftsData.map(d => d.title));
            draft.draft.should.be.true;
            if (draft.draftCreator)
                draft.draftCreator.should.equal(researchEntity.id);
            else
                draft.draftGroupCreator.should.equal(researchEntity.id);
        });
    }
});
