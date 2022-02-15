/* global require  */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    tableName: 'phd_cycle',
    attributes: {
        name: 'STRING',
        course: {
            collection: 'PhdCourse'
        }
    }
});
