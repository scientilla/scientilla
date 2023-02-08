'use strict';

const Ajv = require('ajv').default;

const defs = require('../schemas/defs.json');
const userProfileDefs = require('../schemas/userProfileDefs.json');
const userProfileDefault = require('../schemas/userProfileDefault.json');
const groupProfile = require('../schemas/groupProfile.json');

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
        userProfileDefs,
        userProfileDefault,
        require('../schemas/userProfileHidden.json'),
        require('../schemas/userProfilePublic.json'),
        require('../schemas/userProfile.json'),
        require('../schemas/userProfileRemoveAdditional.json'),
        require('../schemas/trainingModule.json'),
        groupProfile,
        require('../schemas/groupProfileRemoveAdditional.json'),
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
    getUserProfileValidator: () => {
        return ajv.getSchema('userProfile');
    },
    getUserProfileRemoveAdditionalValidator: () => {
        const value = ajv.opts.removeAdditional;
        ajv.opts.removeAdditional = 'all';
        const schema = ajv.getSchema('userProfileRemoveAdditional');
        ajv.opts.removeAdditional = value;
        return schema;
    },
    getTrainingModuleValidator: () => {
        return ajv.getSchema('trainingModule');
    },
    getDefaultUserProfile: () => {
        const userProfileDefsJSON = JSON.stringify(userProfileDefs);
        const updatedUserProfileDefsJSON = userProfileDefsJSON.replace(new RegExp('userProfileDefs#', 'g'), '#')
            .replace(new RegExp('defs#', 'g'), '#');
        const updatedUserProfileDefs = JSON.parse(updatedUserProfileDefsJSON);

        const profileDefaultJSON = JSON.stringify(userProfileDefault.definitions.userProfile);
        const updatedRefsProfileDefaultJSON = profileDefaultJSON.replace(new RegExp('userProfileDefs#', 'g'), '#')
            .replace(new RegExp('defs#', 'g'), '#');
        const updatedRefsProfileDefault = JSON.parse(updatedRefsProfileDefaultJSON);

        updatedRefsProfileDefault.definitions = _.merge(
            defs.definitions,
            updatedUserProfileDefs.definitions
        );

        return defaults({
            type: 'object',
            definitions: updatedRefsProfileDefault.definitions,
            properties: updatedRefsProfileDefault.properties
        });
    },
    getGroupProfileRemoveAdditionalValidator: () => {
        const value = ajv.opts.removeAdditional;
        ajv.opts.removeAdditional = 'all';
        const schema = ajv.getSchema('groupProfileRemoveAdditional');
        ajv.opts.removeAdditional = value;
        return schema;
    },
    getGroupProfileValidator: () => {
        return ajv.getSchema('groupProfile');
    },
    getDefaultGroupProfile: () => {
        const groupProfileJSON = JSON.stringify(groupProfile);
        const updatedRefsGroupProfileJSON = groupProfileJSON.replace(new RegExp('userProfileDefs#', 'g'), '#')
            .replace(new RegExp('defs#', 'g'), '#');
        const updatedRefsGroupProfile = JSON.parse(updatedRefsGroupProfileJSON);

        updatedRefsGroupProfile.definitions = _.merge(
            defs.definitions,
            updatedRefsGroupProfile.definitions
        );

        return defaults({
            type: 'object',
            definitions: updatedRefsGroupProfile.definitions,
            properties: updatedRefsGroupProfile.properties
        });
    }
};
