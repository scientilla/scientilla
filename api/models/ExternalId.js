/**
 * ExternalId.js
 */
const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    attributes: {
        researchEntity: 'STRING',
        document: 'STRING',
        origin: 'STRING'
    }
});

