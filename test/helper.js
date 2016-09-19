/* global User, Promise, Auth, Reference */

var should = require('should');
var assert = require('assert');

module.exports = {
    cleanDb: function () {
        var models = [Auth, User, Reference];
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
    getUsers: function () {
        return users;
    },
    getDocuments: function () {
        return documents;
    }
};

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

var documents = [{
        title: "A Bayesian approach towards affordance learning in artificial agents",
        authors: "Semprini F., Tikhanoff V., Pattacini U., Nori F. and Bozzini F.",
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
        authors: "Stramandinoli F., Tikhanoff V., Pattacini U., Nori F. and Bozzini F.",
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