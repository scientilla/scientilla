/* global require, it, describe, before */

'use strict';

const test = require('./../helper.js');

describe('Authors: ', () => {
    const usersData = test.getAllUserData();
    const itemsData = test.getAllResearchItemData();
    const allAuthorsStrs = [
        'Semprini F.',
        'Casier D.',
        'Molinari E.',
        'Moschini U.'
    ];
    let adminUser, user, researchEntity, itemTypes;

    before(async () => {
        await test.clean();
        adminUser = await test.registerUser(usersData[1]);
        user = await test.registerUser(usersData[0]);
        researchEntity = await test.researchEntity.getByUser(user);
        itemTypes = await test.researchItem.getTypes();
    });


    it('Creating a draft should create relative Author records', async () => {
        const authorsStrs = allAuthorsStrs.slice(0, 2);

        const typeId = itemTypes.find(it => it.key === 'award_achievement').id;
        const itemData = Object.assign({}, itemsData[0], {type: typeId});
        itemData.authorsStr = authorsStrs.join(', ');
        await test.researchEntity.createDraft(user, researchEntity, itemData);

        const drafts = await test.researchEntity.getAccomplishmentDrafts(researchEntity, ['authors']);
        const authors = drafts[0].authors;

        authors.length.should.equal(authorsStrs.length);
        authorsStrs.forEach(
            (authorStr, position) => authors.find(a => a.position === position).authorStr.should.equal(authorStr)
        );

    });

    it('When updating the authorsStr adding authors new Author records should be created', async () => {
        const authorsStrs = allAuthorsStrs;
        const authors = await updateDraft(authorsStrs.join(', '));

        authors.length.should.equal(authorsStrs.length);
        authorsStrs.forEach(
            (authorStr, position) => authors.find(a => a.position === position).authorStr.should.equal(authorStr)
        );
    });

    it('When updating the authorsStr removing authors the relative Author records should be deleted', async () => {
        const authorsStrs = allAuthorsStrs.slice(0, 3);
        const authors = await updateDraft(authorsStrs.join(', '));

        authors.length.should.equal(authorsStrs.length);
        authorsStrs.forEach(
            (authorStr, position) => authors.find(a => a.position === position).authorStr.should.equal(authorStr)
        );
    });

    it('When updating the authorsStr substituting an author the relative Author record should be updated', async () => {
        const authorsStrs = [allAuthorsStrs[0], allAuthorsStrs[1], allAuthorsStrs[3]];
        const authors = await updateDraft(authorsStrs.join(', '));

        authors.length.should.equal(authorsStrs.length);
        authorsStrs.forEach(
            (authorStr, position) => authors.find(a => a.position === position).authorStr.should.equal(authorStr)
        );
    });

    it('All the above together', async () => {
        const authorsStrs = [allAuthorsStrs[3], allAuthorsStrs[0], allAuthorsStrs[1], allAuthorsStrs[2]];
        const authors = await updateDraft(authorsStrs.join(', '));

        authors.length.should.equal(authorsStrs.length);
        authorsStrs.forEach(
            (authorStr, position) => authors.find(a => a.position === position).authorStr.should.equal(authorStr)
        );
    });


    async function updateDraft(newAuthorStr) {
        let drafts = await test.researchEntity.getAccomplishmentDrafts(researchEntity);
        const draftData = drafts[0];
        draftData.authorsStr = newAuthorStr;
        await test.researchEntity.updateDraft(user, researchEntity, draftData);

        drafts = await test.researchEntity.getAccomplishmentDrafts(researchEntity, ['authors']);
        return drafts[0].authors;
    }


});
