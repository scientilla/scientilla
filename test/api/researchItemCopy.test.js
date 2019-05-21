/*global require, it, describe, before */

'use strict';

const test = require('./../helper.js');

describe('ResearchItem Copy to draft: ', () => {
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

    it('it should be possible to copy a verified item to drafts ', async () => {
        const creatorResearchEntity = researchEntities[0];
        const copierResearchEntity = researchEntities[1];
        const creatorUser = users[0];
        const copierUser = users[0];
        const typeId = itemTypes.find(it => it.key === 'award_achievement').id;
        const itemData = Object.assign({}, itemsData[0], {type: typeId});

        let res = await test.researchEntity.createDraft(creatorUser, creatorResearchEntity, itemData);
        res.success.should.be.equal(true);

        verifiedItem = (await test.researchEntity.getAccomplishmentDrafts(creatorResearchEntity, [], {title: itemData.title}))[0];
        res = await test.researchEntity.verifyItem(creatorUser, creatorResearchEntity, verifiedItem.id, {
            position: 0,
            affiliations: [1]
        });
        res.success.should.be.equal(true);

        const verifiedAccomplishments = await test.researchEntity.getVerifiedAccomplishment(creatorResearchEntity);

        verifiedAccomplishments.length.should.be.equal(1);
        verifiedAccomplishments[0].title.should.be.equal(verifiedItem.title);
        verifiedAccomplishments[0].kind.should.be.equal('v');

        res = await test.researchEntity.copyItemToDrafts(copierUser, copierResearchEntity, verifiedItem);
        res.success.should.be.equal(true);

        const drafts = await test.researchEntity.getAccomplishmentDrafts(copierResearchEntity);

        drafts.length.should.be.equal(1);
        drafts[0].authorsStr.should.be.equal(verifiedItem.authorsStr);

    });
});
