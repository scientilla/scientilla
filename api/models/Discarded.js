const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    attributes: {
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity',
        },
        researchItem: {
            columnName: 'research_item',
            model: 'researchitem'
        }
    },
    tableName: 'discarded',
});

