/**
 * ExternalGroup.js
 */
const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    attributes: {
        researchEntity: {
            model: 'Group',
        },
        document: {
            model: 'Document'
        },
        origin: 'STRING'
    }
});