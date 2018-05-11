/* global Citation*/
"use strict";
/**
 * Citation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");
const fields = [
    'origin',
    'originId',
    'year',
    'citations'
];

module.exports = _.merge({}, BaseModel, {
    attributes: {
        origin: 'string',
        originId: 'string',
        year: 'integer',
        citations: 'integer'
    },
    selectData: data => {
        return _.pick(data, fields);
    },
    createOrUpdate: async (criteria, data) => {
        const selectedData = Citation.selectData(data);

        let citation = await Citation.findOne(criteria);
        if (citation)
            await Citation.update(criteria, selectedData);
        else
            await Citation.create(selectedData);

        return await Citation.findOne(criteria);
    },
});