/* global Citation*/
"use strict";
/**
 * SourceMetric.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    attributes: {
        source: {
            model: 'source'
        },
        issn: 'string',
        eissn: 'string',
        origin: 'string',
        sourceOriginId: 'string',
        sourceTitle: 'string',
        year: 'integer',
        name: 'string',
        value: 'string',
    },
});