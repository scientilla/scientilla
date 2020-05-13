'use strict';

const Ajv = require('ajv');

const ajv = new Ajv({
    allErrors: true,
    removeAdditional: true,
    useDefaults: true,
    jsonPointers: true,
    schemas: [
        require('../schemas/defs.json'),
        require('../schemas/projectDefs.json'),
        require('../schemas/projectIndustrial.json'),
        require('../schemas/projectCompetitive.json'),
    ]
});

module.exports = {
    getProjectCompetitiveValidator: () => {
        return ajv.getSchema('projectCompetitive');
    },
    getProjectIndustrialValidator: () => {
        return ajv.getSchema('projectCompetitive');
    },
};