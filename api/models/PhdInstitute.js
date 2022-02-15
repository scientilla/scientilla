/* global require  */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    tableName: 'phd_institute',
    attributes: {
        name: 'STRING'
    }
});


