/* global User */
'use strict';

const should = require('should');
const test = require('./../helper.js');

describe('Draft Verification', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData();
    const institutesData = test.getAllInstituteData();

    const user1Data = usersData[0];
    const user2Data = usersData[1];
    const documentData = documentsData[0];
    const incompleteDocumentData = documentsData[1];
    const iitInstituteData = institutesData[0];
    const unigeInstituteData = institutesData[1];
    const nonExistentDocument = {id: 1000};
    let user1;
    let user2;
    let user1Draft1;
    let user1Draft2;
    let user2Draft1;
    const user1Doc1Position = 4;
    const user2Doc1Position = 0;
    let iitInstitute;
    let unigeInstitute;
    let author2affiliationInstitutes;

    it('there should be no verified documents for a new user', () =>
        test
            .registerUser(user1Data)
            .then(res =>user1 = res.body)
            .then(() =>test.createInstitute(iitInstituteData))
            .then(res => iitInstitute = res.body)
            .then(() =>test.createInstitute(unigeInstituteData))
            .then(res =>unigeInstitute = res.body)
            .then(() => test.getUserDocuments(user1)
                .expect(200, []))
    );

    it('verifying a complete draft should be possible', () =>
        test.userCreateDraft(user1, documentData)
            .then(res => user1Draft1 = res.body)
            .then(() => {
                const affiliations = [iitInstitute.id];
                return test
                    .userVerifyDraft(user1, user1Draft1, user1Doc1Position, affiliations)
                    .expect(res => {
                        res.status.should.equal(200);
                        const document = res.body;
                        document.title.should.equal(documentData.title);
                        document.draft.should.be.false;
                        should(document.draftCreator).be.null;
                    });
            })
            .then(() =>test.getUserDrafts(user1)
                .expect(200, []))
            .then(() =>test
                .getUserDocumentsWithAuthors(user1)
                .expect(res => {
                    res.status.should.equal(200);
                    res.body.should.have.length(1);
                    const document = res.body[0];
                    document.title.should.equal(documentData.title);
                    document.draft.should.be.false;
                    should(document.draftCreator).be.null;
                    document.authors.should.have.length(1);
                    document.authors[0].username.should.equal(user1.username);
                    document.authorships.should.have.length(1);
                    document.authorships[0].position.should.equal(user1Doc1Position);
                    document.affiliations.should.have.length(1);
                    document.affiliations[0].institute.should.equal(iitInstitute.id);
                })
            )
    );

    it('verifying a complete draft twice should give an error', ()=>
        test.userVerifyDraft(user1, user1Draft1)
            .expect(400)
    );

    it('verifying a non complete draft should not be possible', () =>
        test.userCreateDraft(user1, incompleteDocumentData)
            .then(res => user1Draft2 = res.body)
            .then(() =>test.userVerifyDraft(user1, user1Draft2)
                .expect(res => {
                    res.status.should.equal(200);
                    res.body.draft.should.be.true;
                }))
            .then(() => test.getUserDrafts(user1)
                .expect(res => {
                    res.status.should.equal(200);
                    res.body.should.have.length(1);
                }))
            .then(() => test.getUserDocuments(user1)
                .expect(res => {
                    res.status.should.equal(200);
                    res.body.should.have.length(1);
                }))
    );

    it('verifying a nonexsting document should give an error', () =>
        test.userVerifyDraft(user1, nonExistentDocument)
            .expect(400)
    );

    it('verifying two identical documents should merge them', () =>
        test.registerUser(user2Data)
            .then(res =>user2 = res.body)
            .then(() =>test.userCreateDraft(user2, documentData)
                .expect(200))
            .then(res => user2Draft1 = res.body)
            .then(() => {
                author2affiliationInstitutes = [unigeInstitute.id, iitInstitute.id];
                return test.userVerifyDraft(user2, user2Draft1, user2Doc1Position, author2affiliationInstitutes)
                    .expect(res => {
                        res.status.should.equal(200);
                        const document = res.body;
                        document.title.should.equal(documentData.title);
                        document.draft.should.be.false;
                        should(document.draftCreator).be.null;
                    });
            })
            .then(() =>test.getUserDocumentsWithAuthors(user2)
                .expect(res => {
                    res.status.should.equal(200);
                    res.body.should.have.length(1);
                    const d = res.body[0];
                    d.id.should.equal(user1Draft1.id);
                    d.title.should.equal(documentData.title);
                    d.draft.should.be.false;
                    should(d.draftCreator).be.null;
                    d.authors[0].username.should.equal(user1.username);
                    d.authors[1].username.should.equal(user2.username);
                    d.authorships.should.have.length(2);
                    d.authorships[0].position.should.equal(user1Doc1Position);
                    d.authorships[1].position.should.equal(user2Doc1Position);
                    d.affiliations.should.have.length(3);
                    d.affiliations[0].institute.should.equal(iitInstitute.id);
                    const author2affiliations = d.affiliations.filter(a => a.authorship === d.authorships[1].id);
                    const author2affiliationInstitutesActual = _.map(author2affiliations, 'institute');
                    author2affiliationInstitutesActual.should.containDeep(author2affiliationInstitutes);
                }))
    );

});