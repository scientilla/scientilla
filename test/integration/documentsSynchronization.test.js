"use strict";

var test = require('./../helper.js');


describe('Synchronization', function () {
    before(test.cleanDb);
    after(test.cleanDb);

    const documentsData = test.getAllDocumentData();
    const userData = test.getAllUserData()[0];
    const institutesData = test.getAllInstituteData();
    const sourcesData = test.getAllSourceData();
    let user, draft, institute, externalDocument;

    it("should update a draft that was copied from external", async function () {
        const newTitle = 'test';
        user = await User.registerUser(userData);
        institute = await Institute.create(institutesData[0]);
        const journal = await Source.create(sourcesData[0]);
        const doc1 = documentsData[0];
        doc1.source = journal.id;
        doc1.authorships = [{corresponding: true, affiliations: [institute.id], position: 1}];
        externalDocument = await test.createExternalDocument(doc1);
        draft = await User.createDraft(User, user.id, externalDocument);
        await Document.update(externalDocument.id, {title: newTitle});
        await Synchronizer.synchronizeScopus();
        const updatedDraft = await Document.findOneById(draft.id);
        updatedDraft.title.should.equal(newTitle);
    });

    it("should update a verified document that was copied from external", async function() {
        const newTitle = 'test 2';
        const d = await Document.findOneById(draft.id);

        const document = await User.verifyDraft(User, user.id, draft.id, 1, [institute.id], true);
        await Document.update(externalDocument.id, {title: newTitle});
        await Synchronizer.synchronizeScopus();
        const updatedDocument = await Document.findOneById(document.id);
        updatedDocument.title.should.equal(newTitle);
    });

    it("should not update a verified document that was copied from external", async function() {
        const newDraftTitle = 'test 3';
        const newUpdatedDocumentTitle = 'test 4';

        let draft2 = await User.createDraft(User, user.id, externalDocument);
        const d = await User.updateDraft(User, draft2.id, {title: newDraftTitle});
        const updatedDocument = await Document.findOneById(draft2.id);
        await Synchronizer.synchronizeScopus();
        draft2 = await Document.findOneById(draft2.id);
        draft2.title.should.equal(newDraftTitle);
    });

});