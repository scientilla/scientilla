/* global angular */
const projectOrigins = {
    SCIENTILLA: 'scientilla'
};


const projectFieldsRules = {
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

const projectListSections = {
    //SUGGESTED: 'suggested-projects',
    VERIFIED: 'verified-projects',
    //DRAFT: 'draft-list-projects',
    GROUP: 'group-verified-projects',
    USER: 'user-verified-projects'
};

const projectEventTypes = [
    {key: 'scientific_conference', label: 'Conference'},
    {key: 'workshop', label: 'Workshop/Symposium'},
    {key: 'school', label: 'School (Summer school, ...)'},
];

const projectRequiredFields = {
    project_competitive: [
    ],
    project_industrial: [
    ]
};

angular.module('app')
    .constant('projectOrigins', projectOrigins)
    .constant('projectFieldsRules', projectFieldsRules)
    .constant('projectListSections', projectListSections)
    .constant('projectRequiredFields', projectRequiredFields)
    .constant('projectEventTypes', projectEventTypes);