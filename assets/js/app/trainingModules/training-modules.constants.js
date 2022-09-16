/* global angular */

const trainingModuleListSections = {
    SUGGESTED: 'suggested-training-modules',
    VERIFIED: 'verified-training-modules',
    GROUP: 'group-verified-training-modules',
    USER: 'user-verified-training-modules'
};

const trainingModuleFieldsRules = {
    authorsStr: {
        allowNull: false,
        regex: /^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)*$/,
        message: 'Author string is not valid. It should be in the form \"Molinari E., Bozzini F., Semprini F.\".'
    },
    year: {
        allowNull: false,
        regex: /^(19|20)\d{2}$/,
        message: 'This year is not valid. It should be like: 2018'
    }
};

const trainingModuleRequiredFields = [
    'authorsStr',
    'referent',
    'title',
    'year',
    'description',
    'hours',
    'lectures',
    'researchDomains',
    'location',
    'delivery',
    'type'
];

const trainingModuleType = 'training_module';

const trainingModuleDeliveryOptions = {
    ON_LINE: "On Line",
    IN_PRESENCE: "In Presence",
    ON_LINE_IN_PRESENCE: "On Line/In Presence"
};

const trainingModuleSoftSkillsResearchDomain = 'Soft Skills';

angular.module('trainingModules')
    .constant('trainingModuleListSections', trainingModuleListSections)
    .constant('trainingModuleFieldsRules', trainingModuleFieldsRules)
    .constant('trainingModuleRequiredFields', trainingModuleRequiredFields)
    .constant('trainingModuleType', trainingModuleType)
    .constant('trainingModuleDeliveryOptions', trainingModuleDeliveryOptions)
    .constant('trainingModuleSoftSkillsResearchDomain', trainingModuleSoftSkillsResearchDomain);
