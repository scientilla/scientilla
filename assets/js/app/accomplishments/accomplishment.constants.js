/* global angular */
const accomplishmentOrigins = {
    SCIENTILLA: 'scientilla'
};

const accomplishmentSourceTypes = [
    {id: 'book', label: 'Book', type: 'scientific'},
    {id: 'journal', label: 'Journal', type: 'scientific'},
    {id: 'bookseries', label: 'Book Series', type: 'scientific'},
];

const accomplishmentFieldsRules = {
    authorsStr: {
        allowNull: false,
        regex: /^(([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)(,\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+(\s([a-zA-ZÀ-ÖØ-öø-ÿ]|-|')+)*\s(([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)(\s?([a-zA-ZÀ-ÖØ-öø-ÿ]|-)+\.)*)*$/,
        message: 'Author string is not valid. It should be in the form \"Molinari E., Bozzini F., Semprini F.\".'
    },
    year: {
        allowNull: false,
        regex: /^(19|20)\d{2}$/,
        message: 'This year is not valid. It should be like: 2018'
    },
    yearTo: {
        allowNull: true,
        regex: /^(19|20)\d{2}$/,
        message: 'This year is not valid. It should be like: 2018'
    }
};

const accomplishmentListSections = {
    VERIFIED: 'verified-accomplishments',
    DRAFT: 'draft-list-accomplishments',
    GROUP: 'group-verified-accomplishments',
    USER: 'user-verified-accomplishments'
};

const accomplishmentEventTypes = [
    {key: 'scientific_conference', label: 'Conference'},
    {key: 'institute', label: 'Institute'},
    {key: 'workshop', label: 'Workshop/Symposium'},
    {key: 'school', label: 'School (Summer school, ...)'},
];

const accomplishmentRequiredFields = {
    editorship: [
        'authorsStr',
        'year',
        'medium'
    ],
    award_achievement: [
        'authorsStr',
        'year',
        'title'
    ],
    organized_event: [
        'authorsStr',
        'year',
        'title',
        'eventType'
    ]
};

angular.module('app')
    .constant('accomplishmentSourceTypes', accomplishmentSourceTypes)
    .constant('accomplishmentOrigins', accomplishmentOrigins)
    .constant('accomplishmentFieldsRules', accomplishmentFieldsRules)
    .constant('accomplishmentListSections', accomplishmentListSections)
    .constant('accomplishmentRequiredFields', accomplishmentRequiredFields)
    .constant('accomplishmentEventTypes', accomplishmentEventTypes);