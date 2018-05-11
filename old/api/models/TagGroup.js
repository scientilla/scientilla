'use strict';

/**
 * TagGroup.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
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
        tagLabel: {
            model: 'TagLabel'
        }
    }
});

