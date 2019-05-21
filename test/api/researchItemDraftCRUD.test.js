/* global require, it, describe, before */

'use strict';

const test = require('./../helper.js');

describe('Item Draft: ', () => {
    const usersData = test.getAllUserData();
    const itemsData = test.getAllResearchItemData();
    const sourcesData = test.getAllSourceData();
    let adminUser, user, researchEntity, itemTypes;

    before(async () => {
        await test.clean();
        adminUser = await test.registerUser(usersData[1]);
        user = await test.registerUser(usersData[0]);
        researchEntity = await test.researchEntity.getByUser(user);
        itemTypes = await test.researchItem.getTypes();
    });


    it('a researchEntity should be able to create an award item draft', async () => {
        const typeId = itemTypes.find(it => it.key === 'award_achievement').id;
        const itemData = Object.assign({}, itemsData[0], {type: typeId});
        const res = await test.researchEntity.createDraft(user, researchEntity, itemData);
        res.success.should.be.equal(true);

        const drafts = await test.researchEntity.getAccomplishmentDrafts(researchEntity);

        const itemAwardDrafts = drafts.filter(d => d.type === typeId);
        itemAwardDrafts.length.should.equal(1);
        itemAwardDrafts[0].title.should.equal('Nobel prize');
    });


    it('a researchEntity should be able to create an organized event item draft', async () => {
        const typeId = itemTypes.find(it => it.key === 'organized_event').id;
        const itemData = Object.assign({}, itemsData[1], {type: typeId});
        const res = await test.researchEntity.createDraft(user, researchEntity, itemData);
        res.success.should.be.equal(true);

        const drafts = await test.researchEntity.getAccomplishmentDrafts(researchEntity);

        const itemEventDrafts = drafts.filter(d => d.type === typeId);
        itemEventDrafts.length.should.equal(1);
        itemEventDrafts[0].title.should.equal('IEEE 2017');
    });


    it('a researchEntity should be able to create an editorship item draft', async () => {
        const typeId = itemTypes.find(it => it.key === 'editorship').id;
        const source = await test.createSource(sourcesData[0]);
        const itemData = itemsData[2];
        itemData.medium = source.id;

        const res = await test.researchEntity.createDraft(user, researchEntity, Object.assign({}, itemData, {type: typeId}));
        res.success.should.be.equal(true);

        const drafts = await test.researchEntity.getAccomplishmentDrafts(researchEntity);

        const itemEditorshipDrafts = drafts.filter(d => d.type === typeId);
        itemEditorshipDrafts.length.should.equal(1);
        itemEditorshipDrafts[0].medium.should.equal(source.id);
    });

    it('should be possibile to update an item draft', async () => {
        let drafts = await test.researchEntity.getAccomplishmentDrafts(researchEntity);
        const draftData = Object.assign({}, drafts[0], {title: 'test'});
        const res = await test.researchEntity.updateDraft(user, researchEntity, draftData);
        res.success.should.be.equal(true);

        drafts = await test.researchEntity.getAccomplishmentDrafts(researchEntity, [], {title: 'test'});

        drafts.length.should.equal(1);
        drafts[0].title.should.equal('test');
    });


});
