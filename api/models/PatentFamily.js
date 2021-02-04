/* global require, PatentFamilies */
'use strict';

const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");


module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {},
    attributes: {
        docket: 'STRING',
        patents: 'JSON'
    },
    migrate: 'safe',
    tableName: 'patent_family',
    autoUpdatedAt: false,
    autoCreatedAt: false
});


