/* global Reference */
'use strict';

var test = require('./../helper.js');

describe('Document model', () => {

    describe('isValid', () => {

        it('should be able to validate a document that is complete', () => {
            const documentData = test.getAllDocumentData()[0];
            const document = test.createModel(Reference, documentData);
            document.isValid().should.be.true;
        });

        it('should be able to reject a document that is not complete', () => {
            const documentData = test.getAllDocumentData()[1];
            const document = test.createModel(Reference, documentData);
            document.isValid().should.be.false;
        });

    });

    describe('getFullAuthorships', () => {

        it('should return empty array with empty affiliations and authorships', () => {
            const documentData = test.getAllDocumentData()[0];
            const document = test.createModel(Reference, documentData);
            document.authorships = [];
            document.affiliations = [];

            document.getFullAuthorships().should.be.empty;
        });

        it('should return a consistent structure', () => {
            const documentData = test.getAllDocumentData()[0];
            const document = test.createModel(Reference, documentData);
            document.authorships = [
                {id: 103, position: 0},
                {id: 105, position: 1},
                {id: 101, position: 2},
                {id: 102, position: 3},
                {id: 104, position: 4},
            ];
            document.affiliations = [
                {id: 6, authorship: 101, institute: 1},
                {id: 8, authorship: 101, institute: 2},
                {id: 9, authorship: 101, institute: 3},
                {id: 10, authorship: 102, institute: 4},
                {id: 11, authorship: 104, institute: 5},
                {id: 14, authorship: 110, institute: 6},
                {id: 24, authorship: 104, institute: 10},
                {id: 34, authorship: 103, institute: 11},
                {id: 76, authorship: 103, institute: 12},
                {id: 19, authorship: 110, institute: 13},
            ];

            const res1 = document.getFullAuthorships();
            res1.should.have.length(5);

            const auth103 = res1[0];
            auth103.id.should.be.equal(103);
            auth103.affiliations.should.have.length(2);
            auth103.affiliations[0].id.should.be.equal(34);
            auth103.affiliations[1].id.should.be.equal(76);

            const auth105 = res1[1];
            auth105.id.should.be.equal(105);
            auth105.affiliations.should.have.length(0);

            const auth101 = res1[2];
            auth101.id.should.be.equal(101);
            auth101.affiliations.should.have.length(3);
            auth101.affiliations[0].id.should.be.equal(6);
            auth101.affiliations[1].id.should.be.equal(8);
            auth101.affiliations[2].id.should.be.equal(9);

            const auth102 = res1[3];
            auth102.id.should.be.equal(102);
            auth102.affiliations.should.have.length(1);
            auth102.affiliations[0].id.should.be.equal(10);

            const auth104 = res1[4];
            auth104.id.should.be.equal(104);
            auth104.affiliations.should.have.length(2);
            auth104.affiliations[0].id.should.be.equal(11);
            auth104.affiliations[1].id.should.be.equal(24);
        });

    });

    const usersData = test.getAllUserData();
    const documentsData = test.getAllDocumentData();
    const institutesData = test.getAllInstituteData();
    let users = [];
    let document;
    let institutes;

    describe('findCopies', () => {
        it('should only find verified documents with same data and affiliations', () => {

            //TODO move db initialization to a more suitable place
            return User.createCompleteUser(usersData[0])
                .then(u=> users.push(u))
                .then(()=>User.createCompleteUser(usersData[1]))
                .then(u=> users.push(u))
                .then(()=>Institute.create(institutesData))
                .then(i=> institutes = i)
                .then(()=> {
                    const docData = _.merge({}, documentsData[5], {
                        authorships: [
                            {
                                position: 0,
                                researchEntity: null,
                                affiliations: [institutes[0].id, institutes[1].id]
                            },
                            {
                                position: 1,
                                researchEntity: null,
                                affiliations: [institutes[0].id]
                            },
                            {
                                position: 2,
                                researchEntity: null,
                                affiliations: [institutes[1].id]
                            }
                        ]
                    });
                    return User.createDraft(User, users[0].id, docData);
                })
                .then(doc=> {
                    doc.draft = false;
                    doc.draftCreator = null;
                    doc.draftGroupCreator = null;
                    return doc.savePromise();
                })
                .then(doc=> Reference.findOneById(doc.id)
                    .populate('authorships')
                    .populate('affiliations'))
                .then(doc=> {
                    document = doc;

                    const authorship = doc.authorships.find(a=>a.position === 0);
                    return Authorship.findOneById(authorship.id)
                        .then(a=> {
                            a.researchEntity = users[0].id;
                            return a.savePromise();
                        })
                })
                .then(()=> {
                    const draftData = _.merge({}, documentsData[5], {
                        authorships: [
                            {
                                position: 0,
                                researchEntity: null,
                                affiliations: [institutes[0].id, institutes[1].id]
                            },
                            {
                                position: 1,
                                researchEntity: null,
                                affiliations: [institutes[0].id]
                            },
                            {
                                position: 2,
                                researchEntity: null,
                                affiliations: [institutes[1].id]
                            }
                        ]
                    });
                    return User.createDraft(User, users[1].id, draftData);
                }).then(d=> Reference.findOneById(d.id)
                    .populate('authorships')
                    .populate('affiliations'))
                .then(d => Reference.findCopies(d, 1))
                .then(copies => {
                    copies.should.have.length(1);
                    copies[0].id.should.be.equal(document.id);
                    copies[0].affiliations.should.have.length(4);
                });
        });

        it('should not find verified documents with different data', () => {
            const docData = _.merge({}, documentsData[1], {
                authorships: [
                    {
                        position: 0,
                        researchEntity: null,
                        affiliations: [institutes[0].id, institutes[1].id]
                    },
                    {
                        position: 1,
                        researchEntity: null,
                        affiliations: [institutes[0].id]
                    },
                    {
                        position: 2,
                        researchEntity: null,
                        affiliations: [institutes[1].id]
                    }
                ]
            });

            return User.createDraft(User, users[1].id, docData)
                .then(d=> Reference.findOneById(d.id)
                    .populate('authorships')
                    .populate('affiliations'))
                .then(d =>Reference.findCopies(d, 1))
                .then(copies => copies.should.have.length(0));
        });

        it('should not find verified documents with different institutes on empty positions', () => {
            const docData = _.merge({}, documentsData[5], {
                authorships: [
                    {
                        position: 0,
                        researchEntity: null,
                        affiliations: [institutes[0].id, institutes[1].id]
                    },
                    {
                        position: 1,
                        researchEntity: null,
                        affiliations: [institutes[0].id]
                    },
                    {
                        position: 2,
                        researchEntity: null,
                        affiliations: [institutes[0].id]
                    }
                ]
            });

            return User.createDraft(User, users[1].id, docData)
                .then(d=> Reference.findOneById(d.id)
                    .populate('authorships')
                    .populate('affiliations'))
                .then(d => Reference.findCopies(d, 1))
                .then(copies => copies.should.have.length(0));
        });


    });

});