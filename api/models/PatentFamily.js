/* global require, PatentFamilies */
'use strict';

const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");


module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {},
    migrate: 'safe',
    tableName: 'patent_family',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    attributes: {
        type: {
            model: 'researchitemtype'
        },
        docket: 'STRING',
        patents: 'JSON'
    }
});


