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
        iitGroup = (await test.createGroup(iitGroupData)).body;
        user = (await test.registerUser(usersData[0])).body;
        test.getUserDrafts(user)
            .expect(200, test.EMPTY_RES);
    });

    it('creating user draft should be possible', () =>
        test.userCreateDraft(user, draftsData[0])
            .expect(200)
            .then(() => test
                .getUserDrafts(user)
                .expect(res => {
                    res.status.should.equal(200);
                    const count = res.body.count;
                    const drafts = res.body.items;
                    count.should.be.equal(1);
                    drafts.should.have.length(1);
                    checkDraft(user, draftsData[0], drafts[0]);
                })
            )
    );

    it('there should be no drafts for a new group', async() => {
        group = (await test.createGroup(groupsData[0])).body;
        test.getGroupDrafts(group)
            .expect(200, test.EMPTY_RES);
    });

    it('creating group draft should be possible', async() => {
        await test
            .groupCreateDraft(group, draftsData[1])
            .expect(200);
        test.getGroupDrafts(group)
            .expect(res => {
                res.status.should.equal(200);
                const count = res.body.count;
                const drafts = res.body.items;
                count.should.be.equal(1);
                drafts.should.have.length(1);
                checkDraft(group, draftsData[1], drafts[0]);
            });
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
