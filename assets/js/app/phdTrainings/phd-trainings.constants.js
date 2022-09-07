/* global angular */

const phdTrainingListSections = {
    SUGGESTED: 'suggested-phd-trainings',
    VERIFIED: 'verified-phd-trainings',
    GROUP: 'group-verified-phd-trainings',
    USER: 'user-verified-phd-trainings'
};

const phdTrainingFieldsRules = {
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

const phdTrainingRequiredFields = [
    'authorsStr',
    'referent',
    'institute',
    'phdCourse',
    'title',
    'year',
    'description',
    'otherCourse',
    'hours',
    'lectures',
    'researchDomains',
    'location',
    'delivery',
    'type'
];

const phdTrainingType = 'training_module';

angular.module('phdTrainings')
    .constant('phdTrainingListSections', phdTrainingListSections)
    .constant('phdTrainingFieldsRules', phdTrainingFieldsRules)
    .constant('phdTrainingRequiredFields', phdTrainingRequiredFields)
    .constant('phdTrainingType', phdTrainingType);
