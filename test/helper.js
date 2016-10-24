/* global Auth, User, Group, Reference, Authorship, AuthorshipGroup, Affiliation, Institute */
'use strict';

var should = require('should');
var assert = require('assert');
var request = require('supertest-as-promised');

module.exports = (function () {
    var obj = {
        cleanDb: function () {
            var models = [Auth, User, Group, Reference, Authorship, AuthorshipGroup, Affiliation, Institute];
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
            return users;
        },
        getAllGroupData: function () {
            return groups;
        },
        getAllInstituteData: function () {
            return institutes;
        },
        getAllDocumentData: function () {
            return documents;
        },
        getUsers: function () {
            return request(url)
                .get('/users');
        },
        createGroup: function (groupData) {
            return request(url)
                .post('/groups')
                .send(groupData);
        },
        createInstitute: function (instituteData) {
            return request(url)
                .post('/institutes')
                .send(instituteData);
        },
        registerUser: function (userData) {
            return request(url)
                .post('/auths/register')
                .send(userData);
        },
        getDocuments: function (user, populateFields, qs) {
            return request(url)
                .get('/users/' + user.id + '/documents')
                .query({populate: populateFields})
                .query(qs);
        },
        getDocumentsWithAuthors: function (user) {
            return this.getDocuments(user, ['authors', 'authorships', 'affiliations'], {});
        },
        getSuggestedDocuments: function (user) {
            return request(url)
                .get('/users/' + user.id + '/suggested-documents');
        },
        getDrafts: function (user, populateFields, qs) {
            return request(url)
                .get('/users/' + user.id + '/drafts')
                .query({populate: populateFields})
                .query(qs);
        },
        createDraft: function (user, draftData) {
            return request(url)
                .post('/users/' + user.id + '/drafts')
                .send(draftData);
        },
        updateDraft: function (user, draftData) {
            return request(url)
                .put('/users/' + user.id + '/drafts/' + draftData.id)
                .send(draftData);
        },
        verifyDraft: function (user, draftData, position, affiliations) {
            return request(url)
                .put('/users/' + user.id + '/drafts/' + draftData.id + '/verified')
                .send({position: position, 'affiliations': affiliations});
        },
        unverifyDocument: function (user, document) {
            return request(url)
                .put('/users/' + user.id + '/documents/' + document.id + '/unverified');
        },
        verifyDocument: function (user, document, position, affiliations) {
            return request(url)
                .post('/users/' + user.id + '/documents')
                .send({id: document.id, position: position, 'affiliations': affiliations});
        },
        getDocument: function (documentId) {
            return request(url)
                .get('/references/' + documentId);
        }
    };
    var url = obj.getUrl();
    return obj;
})();

var users = [{
    username: 'federico.bozzini@example.com',
    password: 'userpass',
    name: 'Federico',
    surname: 'Bozzini'
}, {
    username: 'federico.semprini@example.com',
    password: 'userpass',
    name: 'Federico',
    surname: 'Semprini'
}, {
    username: 'elisa.molinari@example.com',
    password: 'userpass',
    name: 'Elisa',
    surname: 'Molinari'
}];

var groups = [{
    name: 'Istituto Italiano di Tecnologia',
    description: '',
    slug: 'iit'
}];

var institutes = [{
    name: 'Istituto Italiano di Tecnologia',
    shortname: 'IIT'
},{
    name: 'Universita di Genova',
    shortname: 'UNIGE'
}];

var documents = [{
    title: "A Bayesian approach towards affordance learning in artificial agents",
    authorsStr: "Semprini F., Tikhanoff V., Pattacini U., Nori F. and Bozzini F.",
    year: "2015",
    journal: null,
    issue: null,
    volume: null,
    pages: "298-299",
    articleNumber: "7346160",
    doi: "10.1109/DEVLRN.2015.7346160",
    bookTitle: null,
    editor: null,
    publisher: null,
    conferenceName: "5th Joint International Conference on Development and Learning and Epigenetic Robotics, ICDL-EpiRob 2015",
    conferenceLocation: "Providence",
    acronym: "ICDL-EpiRob 2015",
    type: "conference_paper",
    sourceType: "conference",
    scopusId: "84962170621",
    wosId: null,
    abstract: "Inspired by recent advances proposed in the ecological psychology community, many developmental robotics studies have started to investigate the modeling and learning of affordances in humanoid robots. In this paper we leverage a probabilistic graphical model in place of the Least Square Support Vector Machine (LSSVM) used in a previous experiment, for testing the Bayesian approach towards affordance learning in the iCub robot. We present two experiments related to the learning of the effect consequent from the tapping of objects from several directions and to the pulling of out-of-reach objects by choosing the appropriate tool. The proposed probabilistic graphical model w.r.t the LSSVM not only identifies a regression function for the prediction of the effects of actions but it provides information on the reliability of the predicted values as well."
}, {
    title: "A Bayesian approach towards affordance learning in artificial agents",
    authorsStr: "Stramandinoli F., Tikhanoff V., Pattacini U., Nori F. and Bozzini F.",
    year: "2015",
    journal: null,
    issue: null,
    volume: null,
    pages: "298-299",
    articleNumber: "7346160",
    doi: "10.1109/DEVLRN.2015.7346160",
    bookTitle: null,
    editor: null,
    publisher: null,
    conferenceName: "5th Joint International Conference on Development and Learning and Epigenetic Robotics, ICDL-EpiRob 2015",
    conferenceLocation: "Providence",
    acronym: "ICDL-EpiRob 2015",
    type: "conference_paper",
    sourceType: null,
    scopusId: "84962170621",
    wosId: null,
    abstract: "Inspired by recent advances proposed in the ecological psychology community, many developmental robotics studies have started to investigate the modeling and learning of affordances in humanoid robots. In this paper we leverage a probabilistic graphical model in place of the Least Square Support Vector Machine (LSSVM) used in a previous experiment, for testing the Bayesian approach towards affordance learning in the iCub robot. We present two experiments related to the learning of the effect consequent from the tapping of objects from several directions and to the pulling of out-of-reach objects by choosing the appropriate tool. The proposed probabilistic graphical model w.r.t the LSSVM not only identifies a regression function for the prediction of the effects of actions but it provides information on the reliability of the predicted values as well."
}];