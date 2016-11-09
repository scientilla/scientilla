/* global User */

'use strict';

var test = require('./../helper.js');

describe('Draft Bulk Creation: ', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData();
    const groupsData = test.getAllGroupData();

    it('creating multiple drafts should be possible for an user', () => {

        const draftsData = [documentsData[2], documentsData[3], documentsData[4]];

        let user;

        return test
            .registerUser(usersData[0])
            .then(res => user = res.body)
            .then(()=>
                test.userCreateDrafts(user, draftsData)
                    .expect(200))
            .then(() => test
                .getUserDrafts(user)
                .expect(res => {
                    res.status.should.equal(200);
                    const count = res.body.count;
                    const documents = res.body.items;
                    count.should.be.equal(3);
                    documents.should.have.length(3);
                    checkDrafts(user, draftsData, documents);
                })
            );
    });

    it('creating multiple drafts should be possible for a group', () => {

        const draftsData = [documentsData[0], documentsData[1], documentsData[2]];

        let group;

        return test
            .createGroup(groupsData[0])
            .then(res => group = res.body)
            .then(()=>
                test.groupCreateDrafts(group, draftsData)
                    .expect(200))
            .then(() => test
                .getGroupDrafts(group)
                .expect(res => {
                    res.status.should.equal(200);
                    const count = res.body.count;
                    const documents = res.body.items;
                    count.should.be.equal(3);
                    documents.should.have.length(3);
                    checkDrafts(group, draftsData, documents);
                })
            );

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
