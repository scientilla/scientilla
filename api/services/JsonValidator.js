'use strict';

const Ajv = require('ajv').default;

const defs = require('../schemas/defs.json');
const profileDefs = require('../schemas/profileDefs.json');
const profileDefault = require('../schemas/profileDefault.json');

const defaults = require('json-schema-defaults');

const ajv = new Ajv({
    allErrors: true,
    removeAdditional: true,
    useDefaults: true,
    schemas: [
        defs,
        require('../schemas/projectDefs.json'),
        require('../schemas/projectIndustrial.json'),
        require('../schemas/projectCompetitive.json'),
        require('../schemas/projectAgreement.json'),
        require('../schemas/patent.json'),
        require('../schemas/patentFamily.json'),
        profileDefs,
        profileDefault,
        require('../schemas/profileHidden.json'),
        require('../schemas/profilePublic.json'),
        require('../schemas/profile.json'),
        require('../schemas/profileRemoveAdditional.json'),
    ]
});

require('ajv-errors')(ajv);
require('ajv-formats')(ajv);

module.exports = {
    getProjectCompetitiveValidator: () => {
        return ajv.getSchema('projectCompetitive');
    },
    getProjectIndustrialValidator: () => {
        return ajv.getSchema('projectCompetitive');
    },
    getProjectAgreementValidator: () => {
        return ajv.getSchema('projectAgreement');
    },
    getPatentValidator: () => {
        return ajv.getSchema('patent');
    },
    getPatentFamilyValidator: () => {
        return ajv.getSchema('patentFamily');
    },
    getProfileValidator: () => {
        const schema = ajv.getSchema('profile');
        return schema;
    },
    getProfileRemoveAdditionalValidator: () => {
        const value = ajv.opts.removeAdditional;
        ajv.opts.removeAdditional = 'all';
        const schema = ajv.getSchema('profileRemoveAdditional');
        ajv.opts.removeAdditional = value;
        return schema;
    },
    getDefaultProfile: () => {
        const profileDefsJSON = JSON.stringify(profileDefs);
        const updatedProfileDefsJSON = profileDefsJSON.replace(new RegExp('profileDefs#', 'g'), '#')
            .replace(new RegExp('defs#', 'g'), '#');
        const updatedProfileDefs = JSON.parse(updatedProfileDefsJSON);

        const profileDefaultJSON = JSON.stringify(profileDefault.definitions.profile);
        const updatedRefsProfileDefaultJSON = profileDefaultJSON.replace(new RegExp('profileDefs#', 'g'), '#')
            .replace(new RegExp('defs#', 'g'), '#');
        const updatedRefsProfileDefault = JSON.parse(updatedRefsProfileDefaultJSON);

        updatedRefsProfileDefault.definitions = _.merge(
            defs.definitions,
            updatedProfileDefs.definitions
        );

        const profile = defaults({
            type: 'object',
            definitions: updatedRefsProfileDefault.definitions,
            properties: updatedRefsProfileDefault.properties
        });

        return profile;
    }
};
