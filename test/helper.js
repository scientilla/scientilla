/* global Auth, User, Group, Document, Authorship, AuthorshipGroup, Affiliation, Institute */
'use strict';

const should = require('should');
const assert = require('assert');
const request = require('supertest');
const _ = require('lodash');

const users = require('./data/users');
const groups = require('./data/groups');
const documents = require('./data/documents');
const institutes = require('./data/institutes');
const sources = require('./data/sources');

module.exports = (function () {
    var obj = {
        cleanDb: function () {
            var models = [Auth, User, Group, Document, Authorship, AuthorshipGroup, Affiliation, Institute, Source];
            var destroyFns =
                models.map(function (model) {
                    return model.destroy();
                });
            return Promise.all(destroyFns);
        },
        createModel: function (Model, data) {
            return _.defaults(data, Model.attributes);
        },
        getUrl: function () {
            //sTODO: get real host.
            return 'http://localhost:1338';
        },
        getAllUserData: function () {
            return _.cloneDeep(users);
        },
        getAllGroupData: function () {
            return _.cloneDeep(groups);
        },
        getAllInstituteData: function () {
            return _.cloneDeep(institutes);
        },
        getAllDocumentData: function () {
            return _.cloneDeep(documents);
        },
        getAllSourceData: function () {
            return _.cloneDeep(sources);
        },
        getUsers: async function (respCode = 200) {
            const res = await request(url)
                .get('/users');
            return res.body;
        },
        createGroup: async function (groupData, respCode = 201) {
            const res = await request(url)
                .post('/groups')
                .send(groupData)
                .expect(respCode);
            return res.body;
        },
        createInstitute: async function (instituteData, respCode = 201) {
            const res = await request(url)
                .post('/institutes')
                .send(instituteData)
                .expect(respCode);
            return res.body;
        },
        createSource: async function (sourceData, respCode = 201) {
            const res = await request(url)
                .post('/sources')
                .send(sourceData)
                .expect(respCode);
            return res.body;
        },
        registerUser: async function (userData, respCode = 200) {
            const res = await request(url)
                .post('/auths/register')
                .send(userData)
                .expect(respCode);
            return res.body;

        },
        getUserDocuments: async function (user, populateFields, qs = {}, respCode = 200) {
            const res = await request(url)
                .get('/users/' + user.id + '/documents')
                .query({populate: populateFields})
                .query(qs)
                .expect(respCode);
            return res.body;
        },
        getUserDocumentsWithAuthors: function (user) {
            return this.getUserDocuments(user, ['authors', 'authorships', 'affiliations'], {});
        },
        getUserSuggestedDocuments: async function (user, respCode = 200) {
            const res = await request(url)
                .get('/users/' + user.id + '/suggestedDocuments')
                .expect(respCode);
            return res.body;
        },
        getUserDrafts: async function (user, populateFields, qs = {}, respCode = 200) {
            const res = await request(url)
                .get('/users/' + user.id + '/drafts')
                .query({populate: populateFields})
                .query(qs)
                .expect(respCode);
            return res.body;
        },
        userCreateDraft: async function (user, draftData, respCode = 200) {
            const res = await request(url)
                .post('/users/' + user.id + '/drafts')
                .send(draftData)
                .expect(respCode);
            return res.body;
        },
        userCreateDrafts: async function (user, draftsData, respCode = 200) {
            const res = await request(url)
                .post('/users/' + user.id + '/copy-drafts')
                .send({documents: draftsData})
                .expect(respCode);
            return res.body;
        },
        userUpdateDraft: async function (user, draftData, respCode = 200) {
            const res = await request(url)
                .put('/users/' + user.id + '/drafts/' + draftData.id)
                .send(draftData)
                .expect(respCode);
            return res.body;
        },
        userVerifyDraft: async function (user, draftData, position, affiliations, corresponding = false, respCode = 200) {
            const res = await request(url)
                .put('/users/' + user.id + '/drafts/' + draftData.id + '/verified')
                .send({position: position, 'affiliations': affiliations, 'corresponding': corresponding})
                .expect(respCode);
            return res.body;
        },
        userVerifyDrafts: async function (user, drafts, respCode = 200) {
            const res = await request(url)
                .put('/users/' + user.id + '/drafts/verify-drafts')
                .send({draftIds: drafts.map(d => d.id)})
                .expect(respCode);
            return res.body;
        },
        addAuthorship: function (document, user, position, pub) {
            return request(url)
                .post('/authorships')
                .send({
                    researchEntity: user.id,
                    document: document.id,
                    position: position,
                    public: pub
                });
        },
        getAuthorships: function (document, populateFields, qs = {}) {
            return request(url).get('/documents/' + document.id + '/authorships')
                .query({populate: populateFields})
                .query(qs);
        },
        addAffiliation: function (authorship, user, institute) {
            return request(url)
                .post('/affiliations')
                .send({
                    authorship: authorship.id,
                    user: user.id,
                    institute: institute.id
                });
        },
        userUnverifyDocument: async function (user, document, respCode = 200) {
            const res = await request(url)
                .put('/users/' + user.id + '/documents/' + document.id + '/unverified')
                .expect(respCode);
            return res.body;
        },
        userVerifyDocument: async function (user, document, position, affiliations, corresponding = false, respCode = 200) {
            const res = await request(url)
                .post('/users/' + user.id + '/documents')
                .send({
                    id: document.id,
                    position: position,
                    'affiliations': affiliations,
                    'corresponding': corresponding
                })
                .expect(respCode);
            return res.body;
        },
        getGroupDrafts: async function (group, populateFields, qs = {}, respCode = 200) {
            const res = await request(url)
                .get('/groups/' + group.id + '/drafts')
                .query({populate: populateFields})
                .query(qs)
                .expect(respCode);
            return res.body;
        },
        groupCreateDraft: async function (group, draftData, respCode = 200) {
            const res = await request(url)
                .post('/groups/' + group.id + '/drafts')
                .send(draftData)
                .expect(respCode);
            return res.body;
        },
        groupCreateDrafts: function (group, draftsData) {
            return request(url)
                .post('/groups/' + group.id + '/copy-drafts')
                .send({documents: draftsData});
        },

        getDocument: async function (documentId, respCode = 200) {
            const res = await request(url)
                .get('/documents/' + documentId)
                .expect(respCode);
            return res.body;
        },
        EMPTY_RES: {count: 0, items: []}
    };
    var url = obj.getUrl();
    return obj;
})();
