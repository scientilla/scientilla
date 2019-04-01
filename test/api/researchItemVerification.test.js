/* global require, it, describe, before */

'use strict';

const test = require('./../helper.js');

describe('Item Verification: ', () => {
    const usersData = test.getAllUserData();
    const itemsData = test.getAllResearchItemData();
    const users = [];
    const researchEntities = [];
    let itemTypes, verifiedItem;

    before(async () => {
        await test.clean();
        users[0] = await test.registerUser(usersData[0]);
        users[1] = await test.registerUser(usersData[1]);
        researchEntities[0] = await test.researchEntity.getByUser(users[0]);
        researchEntities[1] = await test.researchEntity.getByUser(users[1]);
        itemTypes = await test.researchItem.getTypes();
    });

    it('there should be no verified items for a new research entity', async () => {
        const accomplishments = await test.researchEntity.getVerifiedAccomplishment(researchEntities[0]);
        accomplishments.length.should.equal(0);
    });


    it('it should not be possible to verify a wrong draft ', async () => {
        const researchEntity = researchEntities[0];
        const user = users[0];
        const awardTypeId = itemTypes.find(it => it.key === 'award_achievement').id;
        const eventTypeId = itemTypes.find(it => it.key === 'organized_event').id;
        const editorTypeId = itemTypes.find(it => it.key === 'editor').id;

        let draft = await test.researchEntity.createDraft(user, researchEntity, {title: 'test1', type: awardTypeId});
        await test.researchEntity.verifyItem(user, researchEntity, draft.id, {}, 400);

        draft = await test.researchEntity.createDraft(user, researchEntity, {title: 'test2', type: eventTypeId});
        await test.researchEntity.verifyItem(user, researchEntity, draft.id, {}, 400);

        draft = await test.researchEntity.createDraft(user, researchEntity, {title: 'test3', type: editorTypeId});
        await test.researchEntity.verifyItem(user, researchEntity, draft.id, {}, 400);

        const verifiedAccomplishments = await test.researchEntity.getVerifiedAccomplishment(researchEntity);
        verifiedAccomplishments.length.should.be.equal(0);
    });

    it('it should be possible to verify a draft ', async () => {
        const researchEntity = researchEntities[0];
        const user = users[0];
        const typeId = itemTypes.find(it => it.key === 'award_achievement').id;
        const itemData = Object.assign({}, itemsData[0], {type: typeId});
        await test.researchEntity.createDraft(user, researchEntity, itemData);

        verifiedItem = (await test.researchEntity.getAccomplishmentDrafts(researchEntity, [], {title: itemData.title}))[0];
        await test.researchEntity.verifyItem(user, researchEntity, verifiedItem.id);

        const verifiedAccomplishments = await test.researchEntity.getVerifiedAccomplishment(researchEntity);

        verifiedAccomplishments.length.should.be.equal(1);
        verifiedAccomplishments[0].title.should.be.equal(verifiedItem.title);
        verifiedAccomplishments[0].kind.should.be.equal('v');
    });

    it('it should be possible to verify an already verified item ', async () => {
        const researchEntity = researchEntities[1];
        const user = users[1];

        const verifiedAccomplishmentsBefore = await test.researchEntity.getVerifiedAccomplishment(researchEntity);
        verifiedAccomplishmentsBefore.length.should.be.equal(0);

        await test.researchEntity.verifyItem(user, researchEntity, verifiedItem.id);
        const verifiedAccomplishmentsAfter = await test.researchEntity.getVerifiedAccomplishment(researchEntity);
        verifiedAccomplishmentsAfter.length.should.be.equal(1);
        verifiedAccomplishmentsAfter[0].title.should.be.equal(verifiedItem.title);
        verifiedAccomplishmentsAfter[0].kind.should.be.equal('v');
    });

    it('it should be possible to unverify an item ', async () => {
        const researchEntity = researchEntities[0];
        const user = users[0];
        await test.researchEntity.unVerifyItem(user, researchEntity, verifiedItem.id);
        const verifiedAccomplishments = await test.researchEntity.getVerifiedAccomplishment(researchEntity);
        verifiedAccomplishments.length.should.be.equal(0);
    });

    it('an item without connections should be deleted', async () => {
        const researchEntity = researchEntities[1];
        const user = users[1];
        await test.researchEntity.unVerifyItem(user, researchEntity, verifiedItem.id);
        const verifiedAccomplishments = await test.researchEntity.getVerifiedAccomplishment(researchEntity);
        verifiedAccomplishments.length.should.be.equal(0);

        const accomplishments = await test.accomplishment.get([], {title: verifiedItem.title});
        accomplishments.length.should.be.equal(0);
    });
});
