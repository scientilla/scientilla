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

module.exports = {
    cleanDb,
    clean,
    createModel,
    getAllUserData,
    getAllGroupData,
    getAllInstituteData,
    getAllDocumentData,
    getAllSourceData,
    getUsers,
    createGroup,
    createInstitute,
    createSource,
    registerUser,
    getUserDocuments,
    getUserDocumentsWithAuthors,
    getUserSuggestedDocuments,
    getUserDrafts,
    userCreateDraft,
    userCreateDrafts,
    userUpdateDraft,
    groupUpdateDraft,
    userVerifyDraft,
    userVerifyDrafts,
    addAuthorship,
    getAuthorships,
    addAffiliation,
    userUnverifyDocument,
    userVerifyDocument,
    getGroupDrafts,
    groupCreateDraft,
    groupCreateDrafts,
    getDocument,
    createExternalDocument,
    userDeleteDrafts,
    groupDeleteDrafts,
    EMPTY_RES: {count: 0, items: []}
};


let auths = [];

function getAuth(id) {
    return auths.find(b => b.id == id);
}

function getAdminAuth(id) {
    return auths.find(b => b.admin);
}

function cleanAuths() {
    auths = [];
}

const url = 'http://localhost:1338/api/v1';

function cleanDb() {
    var models = [Auth, User, Group, Document, Authorship, AuthorshipGroup, Affiliation, Institute, Source];
    var destroyFns =
        models.map(function (model) {
            return model.destroy();
        });
    return Promise.all(destroyFns);
}

async function clean() {
    await cleanDb();
    cleanAuths();
}

function createModel(Model, data) {
    return _.defaults(data, Model.attributes);
}

function getAllUserData() {
    return _.cloneDeep(users);
}

function getAllGroupData() {
    return _.cloneDeep(groups);
}

function getAllInstituteData() {
    return _.cloneDeep(institutes);
}

function getAllDocumentData() {
    return _.cloneDeep(documents);
}

function getAllSourceData() {
    return _.cloneDeep(sources);
}

async function getUsers(respCode = 200) {
    const res = await request(url)
        .get('/users');
    return res.body;
}

async function createGroup(groupData, respCode = 201) {
    const auth = getAdminAuth();
    const res = await request(url)
        .post('/groups')
        .set('access_token', auth.token)
        .send(groupData)
        .expect(respCode);
    return res.body;
}

async function createInstitute(instituteData, respCode = 201) {
    const auth = getAdminAuth();
    const res = await auth.agent
        .post('/institutes')
        .set('access_token', auth.token)
        .send(instituteData)
        .expect(respCode);
    return res.body;
}

async function createSource(sourceData, respCode = 201) {
    const auth = getAdminAuth();
    const res = await request(url)
        .post('/sources')
        .set('access_token', auth.token)
        .send(sourceData)
        .expect(respCode);
    return res.body;
}

async function registerUser(userData, respCode = 200) {
    var userAgent = request.agent(url);
    const res = await userAgent
        .post('/auths/register')
        .send(userData)
        .expect(respCode);
    if (res.status !== 200)
        return;
    const user = res.body;
    const jwtRes = await userAgent
        .post('/users/jwt')
        .send(userData)
        .expect(200);
    auths.push({
        id: user.id,
        agent: userAgent,
        admin: user.role == 'administrator',
        token: jwtRes.body.token
    });
    return user;
}

async function getUserDocuments(user, populateFields, qs = {}, respCode = 200) {
    const res = await request(url)
        .get('/users/' + user.id + '/documents')
        .query({populate: populateFields})
        .query(qs)
        .expect(respCode);
    return res.body;
}

function getUserDocumentsWithAuthors(user) {
    return this.getUserDocuments(user, ['authors', 'authorships', 'affiliations'], {});
}

async function getUserSuggestedDocuments(user, respCode = 200) {
    const res = await request(url)
        .get('/users/' + user.id + '/suggestedDocuments')
        .expect(respCode);
    return res.body;
}

async function getUserDrafts(user, populateFields, qs = {}, respCode = 200) {
    const res = await request(url)
        .get('/users/' + user.id + '/drafts')
        .query({populate: populateFields})
        .query(qs)
        .expect(respCode);
    return res.body;
}

async function userCreateDraft(user, draftData, respCode = 200) {
    const auth = getAuth(user.id);
    const res = await auth.agent
        .post('/users/' + user.id + '/drafts')
        .set('access_token', auth.token)
        .send(draftData)
        .expect(respCode);
    return res.body;
}

async function userCreateDrafts(user, draftsData, respCode = 200) {
    const auth = getAuth(user.id);
    const res = await auth.agent
        .post('/users/' + user.id + '/copy-drafts')
        .set('access_token', auth.token)
        .send({documents: draftsData})
        .expect(respCode);
    return res.body;
}

async function userUpdateDraft(user, draftData, respCode = 200) {
    const auth = getAuth(user.id);
    const res = await auth.agent
        .put('/users/' + user.id + '/drafts/' + draftData.id)
        .set('access_token', auth.token)
        .send(draftData)
        .expect(respCode);
    return res.body;
}

async function groupUpdateDraft(group, draftData, respCode = 200) {
    const auth = getAdminAuth();
    const res = await auth.agent
        .put('/groups/' + group.id + '/drafts/' + draftData.id)
        .set('access_token', auth.token)
        .send(draftData)
        .expect(respCode);
    return res.body;
}

async function userVerifyDraft(user, draftData, position, affiliations, corresponding = false, respCode = 200) {
    const auth = getAuth(user.id);
    const res = await auth.agent
        .put('/users/' + user.id + '/drafts/' + draftData.id + '/verified')
        .set('access_token', auth.token)
        .send({position: position, 'affiliations': affiliations, 'corresponding': corresponding})
        .expect(respCode);
    return res.body;
}

async function userVerifyDrafts(user, drafts, respCode = 200) {
    const auth = getAuth(user.id);
    const res = await auth.agent
        .put('/users/' + user.id + '/drafts/verify-drafts')
        .set('access_token', auth.token)
        .send({draftIds: drafts.map(d => d.id)})
        .expect(respCode);
    return res.body;
}

function addAuthorship(document, user, position, pub) {
    const auth = getAuth(user.id);
    return auth.agent
        .post('/authorships')
        .set('access_token', auth.token)
        .send({
            researchEntity: user.id,
            document: document.id,
            position: position,
            public: pub
        });
}

function getAuthorships(document, populateFields, qs = {}) {
    return request(url).get('/documents/' + document.id + '/authorships')
        .query({populate: populateFields})
        .query(qs);
}

function addAffiliation(authorship, user, institute) {
    const auth = getAuth(user.id);
    return auth.agent
        .set('access_token', auth.token)
        .send({
            authorship: authorship.id,
            user: user.id,
            institute: institute.id
        });
}

async function userUnverifyDocument(user, document, respCode = 200) {
    const auth = getAuth(user.id);
    const res = await auth.agent
        .put('/users/' + user.id + '/documents/' + document.id + '/unverified')
        .set('access_token', auth.token)
        .expect(respCode);
    return res.body;
}

async function userVerifyDocument(user, document, position, affiliations, corresponding = false, respCode = 200) {
    const auth = getAuth(user.id);
    const res = await auth.agent
        .post('/users/' + user.id + '/documents')
        .set('access_token', auth.token)
        .send({
            id: document.id,
            position: position,
            'affiliations': affiliations,
            'corresponding': corresponding
        })
        .expect(respCode);
    return res.body;
}

async function getGroupDrafts(group, populateFields, qs = {}, respCode = 200) {
    const auth = getAdminAuth();
    const res = await auth.agent
        .get('/groups/' + group.id + '/drafts')
        .set('access_token', auth.token)
        .query({populate: populateFields})
        .query(qs)
        .expect(respCode);
    return res.body;
}

async function groupCreateDraft(group, draftData, respCode = 200) {
    const auth = getAdminAuth();
    const res = await auth.agent
        .post('/groups/' + group.id + '/drafts')
        .set('access_token', auth.token)
        .send(draftData)
        .expect(respCode);
    return res.body;
}

async function groupCreateDrafts(group, draftsData) {
    const auth = getAdminAuth();
    const res = await auth.agent
        .post('/groups/' + group.id + '/copy-drafts')
        .set('access_token', auth.token)
        .send({documents: draftsData});
}

async function getDocument(documentId, respCode = 200) {
    const res = await request(url)
        .get('/documents/' + documentId)
        .expect(respCode);
    return res.body;
}

async function userDeleteDrafts(user, draftIds, respCode = 200) {
    const auth = getAuth(user.id);
    const res = await auth.agent
        .put('/users/' + user.id + '/drafts/delete')
        .set('access_token', auth.token)
        .send({draftIds: draftIds})
        .expect(respCode);
    return res.body;
}

async function groupDeleteDrafts(group, draftIds, respCode = 200) {
    const auth = getAdminAuth();
    const res = await auth.agent
        .put('/groups/' + group.id + '/drafts/delete')
        .set('access_token', auth.token)
        .send({draftIds: draftIds})
        .expect(respCode);
    return res.body;
}

async function createExternalDocument(documentData, origin = DocumentOrigins.SCOPUS) {
    documentData.origin = origin;
    const selectedDraftData = Document.selectData(documentData);
    selectedDraftData.kind = DocumentKinds.EXTERNAL;
    const document = await Document.create(selectedDraftData);
    await Authorship.createEmptyAuthorships(document.id, documentData);
    return Document.findOneById(document.id)
        .populate('authorships')
        .populate('affiliations')
        .populate('authors')
        .populate('source');
}