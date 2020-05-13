const Ajv = require('ajv');
const ajv = new Ajv({
    allErrors: true,
    removeAdditional: true,
    useDefaults: true,
    jsonPointers: true
});
require('ajv-errors')(ajv);

const defaults = require('json-schema-defaults');
const dot = require('dot-object');
// remove after debugging
const util = require('util');

const moment = require('moment');
moment.locale('en');
const ISO8601Format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';

const path = require('path');
const sharp = require('sharp');

const requiredDatePattern = '^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2})\\:(\\d{2})\\:(\\d{2})\\.(\\d{3})Z';
const requiredMessage = 'This field is required.';

const datePattern = '^$|' + requiredDatePattern;
const datePatternMessage = 'This should be a valid date.';

const urlPattern = '^$|^(http|https)://';
const urlPatternMessage = 'This should be a valid URL starting with http:// or https://';

const emptyPattern = '([^\\s])';
const emptyPatternMessage = requiredMessage;

const pathProfileImages = path.join('profile', 'images');

const definitions = {
    privacy: {
        type: 'object',
        properties: {
            privacy: {
                type: 'string'
            }
        },
        required: ['privacy']
    },
    privacyDefaultHidden: {
        type: 'object',
        properties: {
            privacy: {
                default: 'hidden'
            }
        }
    },
    privacyEnumHidden: {
        type: 'object',
        properties: {
            privacy: {
                enum: ['hidden']
            }
        }
    },
    privacyDefaultPublic: {
        type: 'object',
        properties: {
            privacy: {
                default: 'public'
            }
        }
    },
    privacyEnumPublic: {
        type: 'object',
        properties: {
            privacy: {
                enum: ['public']
            }
        }
    },
    privacyEnumInvisible: {
        type: 'object',
        properties: {
            privacy: {
                enum: ['invisible']
            }
        }
    },
    string: {
        type: 'object',
        properties: {
            value: {
                type: 'string'
            }
        }
    },
    name: {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            }
        }
    },
    code: {
        type: 'object',
        properties: {
            code: {
                type: 'string'
            }
        }
    },
    url: {
        type: 'object',
        properties: {
            value: {
                pattern: urlPattern,
                default: ''
            }
        },
        errorMessage: {
            properties: {
                value: urlPatternMessage
            }
        },
        required: ['value']
    },
    notEmptyString: {
        type: 'object',
        properties: {
            value: {
                pattern: emptyPattern
            }
        },
        errorMessage: {
            properties: {
                value: emptyPatternMessage
            }
        },
        required: ['value']
    },
    externalExperience: {
        type: 'object',
        properties: {
            company: {
                type: 'string',
                pattern: emptyPattern
            },
            jobTitle: {
                type: 'string',
                pattern: emptyPattern
            },
            from: {
                type: 'string',
                pattern: requiredDatePattern
            },
            to: {
                pattern: datePattern
            },
            location: {
                type: 'string'
            },
            country: {
                type: 'string'
            },
            jobDescription: {
                type: 'string'
            }
        },
        errorMessage: {
            properties: {
                company: requiredMessage,
                jobTitle: requiredMessage,
                from: datePatternMessage,
                to: datePatternMessage
            }
        },
        required: ['company', 'jobTitle', 'from']
    },
    educationItem: {
        type: 'object',
        properties: {
            institute: {
                type: 'string',
                pattern: emptyPattern
            },
            title: {
                type: 'string',
                pattern: emptyPattern
            },
            from: {
                type: 'string',
                pattern: requiredDatePattern
            },
            to: {
                pattern: datePattern
            },
            location: {
                type: 'string'
            },
            country: {
                type: 'string'
            }
        },
        errorMessage: {
            properties: {
                institute: requiredMessage,
                title: requiredMessage,
                from: datePatternMessage,
                to: datePatternMessage
            }
        },
        required: ['institute', 'title', 'from']
    },
    certificate: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                pattern: emptyPattern
            },
            description: {
                type: 'string'
            },
            date: {
                pattern: datePattern
            },
            favorite: {
                type: 'boolean',
                default: false
            }
        },
        errorMessage: {
            properties: {
                title: requiredMessage,
                date: datePatternMessage
            }
        },
        required: ['title', 'favorite']
    },
    publicWebsite: {
        type: 'object',
        properties: {
            favoritePublications: {
                type: 'boolean',
                default: false
            },
            allPublications: {
                type: 'boolean',
                default: false
            },
            disseminationTalks: {
                type: 'boolean',
                default: false
            },
            scientificTalks: {
                type: 'boolean',
                default: false
            },
            oralPresentations: {
                type: 'boolean',
                default: false
            },
            awardAchievement: {
                type: 'boolean',
                default: false
            },
            organizedEvent: {
                type: 'boolean',
                default: false
            },
            editorship: {
                type: 'boolean',
                default: false
            }
        },
        required: [
            'favoritePublications',
            'allPublications',
            'disseminationTalks',
            'scientificTalks',
            'oralPresentations',
            'awardAchievement',
            'organizedEvent',
            'editorship'
        ]
    },
    export: {
        type: 'object',
        properties: {
            basicInformation: {
                type: 'string',
                default : ''
            }
        }
    },
    internalExperience: {
        type: 'object',
        properties: {

            jobTitle: {
                type: 'string'
            },
            company: {
                type: 'string'
            },
            lines: {
                type: 'array',
                default: [],
                items: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'string'
                        },
                        name: {
                            type: 'string'
                        },
                        office: {
                            type: 'string'
                        }
                    },
                    required: ['code', 'name']
                }
            },
            from: {
                type: 'string'
            },
            to: {
                type: 'string'
            }
        },
        required: ['lines', 'jobTitle', 'company', 'from']
    },
    ifValueCheckPublicPrivacy: {
        if: {
            properties: {
                value: {
                    minLength: 1
                }
            },
            required: ['value']
        },
        then: { $ref: '#/definitions/privacyEnumPublic' }
    },
    ifValueCheckHiddenPrivacy: {
        if: {
            properties: {
                value: {
                    minLength: 1
                }
            },
            required: ['value']
        },
        then: { $ref: '#/definitions/privacyEnumHidden' }
    },
    ifNameCheckHiddenPrivacy: {
        if: {
            properties: {
                name: {
                    minLength: 1
                },
            },
            required: ['name']
        },
        then: { $ref: '#/definitions/privacyEnumHidden' }
    },
    ifJobTitleCheckHiddenPrivacy: {
        if: {
            properties: {
                jobTitle: {
                    minLength: 1
                }
            },
            required: ['jobTitle']
        },
        then: { $ref: '#/definitions/privacyEnumHidden' }
    },
};

definitions.skill = {
    type: 'object',
        properties: {
        value: {
            pattern: emptyPattern
        },
        favorite: {
            type: 'boolean',
            default: false
        },
    },
    errorMessage: {
        properties: {
            value: emptyPatternMessage
        }
    },
    required: ['value', 'favorite']
};

definitions.skillCategory = {
    type: 'object',
        properties: {
        categoryName: {
            type: 'string',
            pattern: emptyPattern
        },
        skills: {
            type: 'array',
            default: [],
            items: _.merge(
                {},
                definitions.privacy,
                definitions.privacyDefaultHidden,
                definitions.notEmptyString,
                definitions.skill
            )
        }
    },
    errorMessage: {
        properties: {
            categoryName: emptyPatternMessage
        }
    },
    required: ['categoryName']
};

const defaultProperties = {
    username: _.merge(
        {},
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    name: _.merge(
        {},
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    surname: _.merge(
        {},
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    jobTitle: _.merge(
        {},
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    roleCategory: _.merge(
        {},
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    phone: _.merge(
        {},
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    groups: {
        type: 'array',
        default: [],
        items: _.merge(
            {},
            definitions.name,
            definitions.code,
            {
                type: 'object',
                properties: {
                    type: {
                        enum: ['Research Line', 'Facility', 'Directorate']
                    },
                    center: _.merge(
                        {},
                        definitions.name,
                        definitions.code
                    ),
                    offices: {
                        type: 'array',
                        default: [],
                        items: {
                            type: 'string'
                        }
                    }
                }
            },
            definitions.privacy,
            definitions.privacyDefaultHidden
        )
    },
    socials: {
        type: 'object',
        properties: {
            linkedin: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
            twitter: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
            facebook: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
            instagram: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
            researchgate: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
            github: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
            bitbucket: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
            youtube: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
            flickr: _.merge(
                {},
                definitions.url,
                definitions.privacy,
                definitions.privacyDefaultHidden
            ),
        }
    },
    image: _.merge(
        {},
        definitions.string,
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    titles: {
        type: 'array',
        default: [],
        items: _.merge(
            {},
            definitions.privacy,
            definitions.privacyDefaultHidden,
            definitions.notEmptyString
        )
    },
    description: _.merge(
        {},
        definitions.string,
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    role: _.merge(
        {},
        definitions.string,
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    website: _.merge(
        {},
        definitions.url,
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    address: _.merge(
        {},
        definitions.string,
        definitions.privacy,
        definitions.privacyDefaultHidden
    ),
    interests: {
        type: 'array',
        default: [],
        items: _.merge(
            {},
            definitions.privacy,
            definitions.privacyDefaultHidden,
            definitions.notEmptyString
        )
    },
    experiencesExternal: {
        type: 'array',
        default: [],
        items: _.merge(
            {},
            definitions.privacy,
            definitions.privacyDefaultHidden,
            definitions.externalExperience
        ),
    },
    education: {
        type: 'array',
        default: [],
        items: _.merge(
            {},
            definitions.privacy,
            definitions.privacyDefaultHidden,
            definitions.educationItem
        )
    },
    certificates: {
        type: 'array',
        default: [],
        items: _.merge(
            {},
            definitions.privacy,
            definitions.privacyDefaultHidden,
            definitions.certificate
        )
    },
    skillCategories: {
        type: 'array',
        default: [],
        items: _.merge(
            {},
            definitions.privacy,
            definitions.privacyDefaultHidden,
            definitions.skillCategory
        )
    },
    hidden: {
        type: 'boolean',
        default: false
    },
    publicWebsite: {$ref: '#/definitions/publicWebsite'},
    export: {$ref: '#/definitions/export'},
    experiencesInternal:{
        type: 'array',
        default: [],
        items: _.merge(
            {},
            definitions.privacy,
            definitions.privacyDefaultHidden,
            definitions.internalExperience
        ),
    }
};

const thenProperties = {
    username: definitions.ifValueCheckHiddenPrivacy,
    name: definitions.ifValueCheckHiddenPrivacy,
    surname: definitions.ifValueCheckHiddenPrivacy,
    jobTitle: definitions.ifValueCheckHiddenPrivacy,
    roleCategory: definitions.ifValueCheckHiddenPrivacy,
    phone: definitions.ifValueCheckHiddenPrivacy,
    groups: {
        items: definitions.ifNameCheckHiddenPrivacy
    },
    image: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    titles: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    description: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    role: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    website: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    address: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    interests: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    socials: {
        properties: {
            linkedin: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            twitter: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            facebook: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            instagram: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            researchgate: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            github: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            bitbucket: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            youtube: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            flickr: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            }
        }
    },
    experiencesExternal: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    education: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    certificates: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    skillCategories: {
        items: {
            allOf: [
                {
                    properties: {
                        skills: {
                            items: {
                                allOf: [
                                    {
                                        oneOf: [
                                            { $ref: '#/definitions/privacyEnumHidden' },
                                            { $ref: '#/definitions/privacyEnumInvisible' }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                },
                {
                    oneOf: [
                        { $ref: '#/definitions/privacyEnumHidden' },
                        { $ref: '#/definitions/privacyEnumInvisible' }
                    ]
                }
            ]
        }
    },
    internalExperiences: {
        items: definitions.ifJobTitleCheckHiddenPrivacy
    },
};

const elseProperties = {
    username: definitions.ifValueCheckPublicPrivacy,
    name: definitions.ifValueCheckPublicPrivacy,
    surname: definitions.ifValueCheckPublicPrivacy,
    jobTitle: definitions.ifValueCheckPublicPrivacy,
    roleCategory: definitions.ifValueCheckPublicPrivacy,
    phone: definitions.ifValueCheckPublicPrivacy,
    groups: {
        items: definitions.ifValueCheckPublicPrivacy
    },
    image: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumPublic' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    titles: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumPublic' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    description: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumPublic' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    role: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumPublic' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    website: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumPublic' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    address: {
        oneOf: [
            { $ref: '#/definitions/privacyEnumHidden' },
            { $ref: '#/definitions/privacyEnumPublic' },
            { $ref: '#/definitions/privacyEnumInvisible' }
        ]
    },
    interests: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumPublic' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    socials: {
        properties: {
            linkedin: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            twitter: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            facebook: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            instagram: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            researchgate: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            github: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            bitbucket: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            youtube: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            },
            flickr: {
                oneOf: [
                    { $ref: '#/definitions/privacyEnumHidden' },
                    { $ref: '#/definitions/privacyEnumPublic' },
                    { $ref: '#/definitions/privacyEnumInvisible' }
                ]
            }
        }
    },
    experiencesExternal: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumPublic' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    education: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumPublic' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    certificates: {
        items: {
            oneOf: [
                { $ref: '#/definitions/privacyEnumHidden' },
                { $ref: '#/definitions/privacyEnumPublic' },
                { $ref: '#/definitions/privacyEnumInvisible' }
            ]
        }
    },
    skillCategories: {
        items: {
            allOf: [
                {
                    properties: {
                        skills: {
                            items: {
                                oneOf: [
                                    { $ref: '#/definitions/privacyEnumHidden' },
                                    { $ref: '#/definitions/privacyEnumPublic' },
                                    { $ref: '#/definitions/privacyEnumInvisible' }
                                ]
                            }
                        }
                    }
                },
                {
                    oneOf: [
                        { $ref: '#/definitions/privacyEnumHidden' },
                        { $ref: '#/definitions/privacyEnumPublic' },
                        { $ref: '#/definitions/privacyEnumInvisible' }
                    ]
                }
            ]
        }
    },
    internalExperiences: {
        items: definitions.ifJobTitleCheckHiddenPrivacy
    },
};

const defaultSchema = {
    type: 'object',
    definitions: definitions,
    properties: defaultProperties,
};

const conditionSchema = {
    type: 'object',
    definitions: definitions,
    if: {
        properties: {
            hidden: {
                type: 'boolean',
                const: true
            }
        }
    },
    then: {
        properties: _.merge({}, defaultProperties, thenProperties)
    },
    else: {
        properties: _.merge({}, defaultProperties, elseProperties)
    }
};

module.exports = {
    attributes: {
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
        imported_data: 'JSON',
        profile: 'JSON',
    },
    tableName: 'research_entity_data',
    getEditProfile: getEditProfile,
    getProfile: getProfile,
    saveProfile: saveProfile,
    exportProfile: exportProfile,
    setupProfile: setupProfile,
    filterProfile: filterProfile
};

/**
 * Returns an object of the filtered property.
 *
 * @param {Object} object
 * @param {Boolean} onlyPublic
 *
 * @returns {Object | Array | Boolean}
 */

function filterProperty(object, onlyPublic = false) {

    switch(true) {
        // If it is an array
        case _.isArray(object) :

            const len = object.length;

            if (len > 0) {
                const array = [];
                // Loop over the array
                for (let i = 0; i < len; i++) {
                    // Filter the current item
                    const filteredProperty = filterProperty(object[i], onlyPublic);
                    if (filteredProperty) {
                        // Push the filtered item
                        array.push(filteredProperty);
                    }
                }

                // Return the array if it's not empty
                if (array.length > 0) {
                    return array;
                }
            }

            return false;

        // If it is an object
        case _.isObject(object) :

            // Return false if the privacy is invisible or isn't public if it needs to be
            if (_.has(object, 'privacy') && (
                object['privacy'] === 'invisible' ||
                onlyPublic && object['privacy'] !== 'public'
            )) {
                return false;
            }

            // Returns the value of the property if the object has a privacy and value property
            if (Object.keys(object).length === 2 && _.has(object, 'privacy') && _.has(object, 'value')) {
                return object['value'];
            }

            // Delete the privacy property
            if (_.has(object, 'privacy')) {
                delete object['privacy'];
            }

            const tmpObject = {};
            // Loop over the object properties
            for (const property in object) {
                // Filter the current property
                const filteredProperty = filterProperty(object[property], onlyPublic);
                if (filteredProperty) {
                    // Save the filter property if it's not false
                    tmpObject[property] = filteredProperty;
                }
            }

            // Return the filtered object if it's not empty
            if (!_.isEmpty(tmpObject)) {
                return tmpObject;
            }

            return false;

            break;
        default:
            return object;
    }
}

/**
 * Returns an object with the filtered profile properties.
 *
 * @param {Object} profile
 * @param {Boolean} onlyPublic
 *
 * @returns {Object} object
 */
function filterProfile(profile, onlyPublic = false) {

    const object = {};
    // Loop over the properties of the object
    for (const property in profile) {
        const filteredProperty = filterProperty(_.cloneDeep(profile[property]), onlyPublic);
        if (filteredProperty) {
            object[property] = filteredProperty
        }
    }

    return object;
}

/**
 * Returns the profile object with defaults
 *
 * @param {Object} userData
 *
 * @returns {Object} profile
 */
function setupProfile(userData) {
    // We store the defaults of the research entity data schema.
    const defaultProfile = defaults(defaultSchema);

    // We merge the defaults with the user's profile
    if (userData && !_.isEmpty(userData.profile)) {

        const associations = {
            'Affiliated Researcher': 'Affiliated Researcher',
            'Amm. della Ricerca': 'Administrative Staff',
            'Amm. Gestione e Ricerca': 'Research Support',
            'Coordinator': 'Administrative Staff',
            'Director General': 'Director General',
            'Ex - Tecnici di Infrastruttura': 'Infrastructure Technician',
            'Ex - Tecnici di Laboratorio': 'Lab Technician',
            'External Collaborator - PhD Stud.Fellow': 'PhD Student',
            'External Collaborator - Post Doc': 'Post Doc',
            'External Collaborator - Researcher': 'Researcher',
            'Facility Coordinator': 'Facility Coordinator',
            'Lab Manager': 'Facility Coordinator',
            'PhD Student': 'PhD Student',
            'PhD Student Fellow': 'PhD Student',
            'Post Doc': 'Post Doc',
            'Post Doc - Fellow': 'Post Doc',
            'Principal Investigator': 'Principal Investigator',
            'Researcher': 'Researcher',
            'Scientific Director': 'Scientific Director',
            'Senior Researcher': 'Researcher',
            'Technologist': 'Technologist',
            'Tecnici di infrastrutture': 'Infrastructure Technician',
            'Tecnici di Laboratorio': 'Lab Technician',
            'Visiting Professor - Researcher': 'Researcher'
        };

        if (!_.has(userData.profile, 'roleCategory.value') || _.isEmpty(userData.profile.roleCategory.value)) {
            userData.profile.roleCategory = {};
            userData.profile.roleCategory.privacy = 'public';
            userData.profile.roleCategory.value = userData.imported_data.Ruolo_1;
        }

        if (_.has(associations, userData.profile.roleCategory.value)) {
            userData.profile.roleCategory.value = associations[userData.profile.roleCategory.value];
        } else {
            userData.profile.roleCategory.value = '';
        }

        if (_.has(userData.profile, 'experiencesExternal') || _.has(userData.profile, 'experiencesInternal')) {

            switch (true) {
                case _.has(userData.profile, 'experiencesExternal') && _.has(userData.profile, 'experiencesInternal') :
                    userData.profile.experiences = userData.profile.experiencesExternal.concat(userData.profile.experiencesInternal);
                    break;
                case !_.has(userData.profile, 'experiencesExternal') && _.has(userData.profile, 'experiencesInternal') :
                    userData.profile.experiences = userData.profile.experiencesInternal;
                    break;
                case _.has(userData.profile, 'experiencesExternal') && !_.has(userData.profile, 'experiencesInternal') :
                    userData.profile.experiences = userData.profile.experiencesExternal;
                    break;
                default:
                    userData.profile.experiences = [];
                    break;
            }

            userData.profile.experiencesExternal = _.orderBy(
                userData.profile.experiencesExternal,
                [
                    experience => new moment(experience.from, ISO8601Format),
                    experience => new moment(experience.to, ISO8601Format)
                ],
                [
                    'desc',
                    'desc'
                ]
            );

            userData.profile.experiencesInternal = _.orderBy(
                userData.profile.experiencesInternal,
                [
                    experience => new moment(experience.from, ISO8601Format),
                    experience => new moment(experience.to, ISO8601Format)
                ],
                [
                    'desc',
                    'desc'
                ]
            );

            userData.profile.experiences = _.orderBy(
                userData.profile.experiences,
                [
                    experience => new moment(experience.from, ISO8601Format),
                    experience => new moment(experience.to, ISO8601Format)
                ],
                [
                    'desc',
                    'desc'
                ]
            );
        }

        return _.merge({}, defaultProfile, userData.profile);
    }

    // We create a new profile with the defaults
    return _.cloneDeep(defaultProfile);
}

/**
 * Returns the profile of the research entity with the editable values.
 *
 * @param {number} researchEntityId
 *
 * @returns {Object}
 */
async function getEditProfile(researchEntityId) {

    // We search if there is already a record for this research entity.
    const data = await UserData.findOne({
        researchEntity: researchEntityId
    });

    // Return false of the data object doesn't have the profile property.
    if (!_.has(data, 'profile') || _.isNil(data.profile)) {
        return false;
    }

    return setupProfile(data);
}

/**
 * Returns the complete filtered profile.
 *
 * @param {number} researchEntityId
 *
 * @returns {Object}
 */
async function getProfile(researchEntityId) {
    let profile = await getEditProfile(researchEntityId);

    // Return false of the profile doesn't exist
    if (!profile) {
        return 'Has no profile!';
    }

    // Filter the profile properties
    profile = filterProfile(profile);

    return profile;
}

/**
 * This function tries to save the profile into the database.
 *
 * First it checks if the passed profile is valid.
 * If that's the case it will be saved in a new record or existing record.
 *
 * The function returns the profile with the errors (if that's is the case), number of errors and related message
 *
 * @param {Object} request
 *
 * @returns {Object}
 */
async function saveProfile(req) {

    const researchEntityId = req.params.researchEntityId;
    const profile = JSON.parse(req.body.profile);

    // Some defaults
    let message = 'Profile has been saved!';
    let errors = [];
    let count = 0;

    // We look for ResearchEntityData by the researchEntityId
    let researchEntityData = await ResearchEntityData.findOne({
        researchEntity: researchEntityId
    });

    const hasFiles = (req._fileparser.upstreams.length > 0);
    if (hasFiles) {
        const imagePath = path.join(pathProfileImages, researchEntityId);

        await new Promise(function (resolve, reject) {

            let filename = req.file('profileImage')._files[0].stream.filename;
            const prefix = '200x200_';
            const filePath = path.resolve(sails.config.appPath, imagePath);
            const originalImage = path.join(filePath, filename);
            const croppedImage = path.join(filePath, prefix + filename);

            req.file('profileImage').upload({
                dirname: filePath,
                saveAs: filename
            }, async function (err, files) {
                if (err) {
                    reject(err);
                }

                await sharp(originalImage)
                    .resize(200, 200)
                    .toFile(croppedImage);

                if (files.length > 0) {
                    let src = files[0].fd.split('/');
                    src = src[src.length - 1];

                    profile.image.value = prefix + src;
                }

                resolve();
            });
        });
    }

    try {
        if (researchEntityData) {
            profile.hidden = researchEntityData.profile.hidden;
        } else {
            profile.hidden = false;
        }

        // We compile our schema & validate profile
        const validate = ajv.compile(conditionSchema);
        const valid = validate(profile);

        // Change removeAdditional option to 'all'
        ajv._opts.removeAdditional = 'all';

        // Re-validate to remove the additional properties
        ajv.validate(defaultSchema, profile);

        // After validating restore original basic information
        // If the profile is valid without any errors
        if (researchEntityData) {
            profile.username = researchEntityData.profile.username;
            profile.name = researchEntityData.profile.name;
            profile.surname = researchEntityData.profile.surname;
            profile.jobTitle = researchEntityData.profile.jobTitle;
            profile.roleCategory = researchEntityData.profile.roleCategory;
            profile.phone = researchEntityData.profile.phone;
            profile.groups = researchEntityData.profile.groups;

            if (!hasFiles && _.has(profile, 'image.value') && !_.isEmpty(profile.image.value)) {
                profile.image.value = researchEntityData.profile.image.value;
            }
        }

        // Sorting experiences
        profile.experiencesExternal = _.orderBy(
            profile.experiencesExternal,
            [
                experience => new moment(experience.from, ISO8601Format),
                experience => new moment(experience.to, ISO8601Format)
            ],
            [
                'desc',
                'desc'
            ]
        );

        profile.experiencesInternal = _.orderBy(
            profile.experiencesInternal,
            [
                experience => new moment(experience.from, ISO8601Format),
                experience => new moment(experience.to, ISO8601Format)
            ],
            [
                'desc',
                'desc'
            ]
        );

        profile.experiences = _.orderBy(
            profile.experiences,
            [
                experience => new moment(experience.from, ISO8601Format),
                experience => new moment(experience.to, ISO8601Format)
            ],
            [
                'desc',
                'desc'
            ]
        );

        // If the profile has some errors
        if (!valid || validate.errors) {

            const row = {};

            // We loop over the validation errors and group the error messages for each field
            for (let i = 0; i < validate.errors.length; i++) {
                let error = validate.errors[i];

                // We ignore the if keyword.
                if (error.keyword === 'if') {
                    continue;
                }

                let path = '';

                if (error.keyword === 'required') {
                    path = error.dataPath.substring(1).replace(/\//g, '.');
                    path += '.errors';
                    path += '.' + error.params.missingProperty;
                    error.message = requiredMessage;
                } else {
                    let pathArray = error.dataPath.substring(1).split('/');
                    let property = pathArray.pop();
                    path = pathArray.join('.');
                    path += '.errors';
                    path += '.' + property;
                }

                if (typeof row[path] === 'undefined') {
                    row[path] = [];
                }

                row[path].push({
                    keyword: error.keyword,
                    message: error.message
                });

                count++;
            }

            // We expand the row object from dotted strings to object
            errors = dot.object(row);

            message = 'Please correct the errors!';
        } else {

            // If the profile is valid without any errors
            if (researchEntityData) {
                // We update the existing record with the new profile
                await ResearchEntityData.update(
                    { id: researchEntityData.id },
                    { profile: profile }
                );
            } else {
                // If there isn't any record yet, we create one for this researchEntity and save the profile.
                await ResearchEntityData.create({
                    researchEntity: researchEntityId,
                    profile: profile
                });
            }

            // Find user and update hasChangedProfile boolean to true if not is already true
            let user = await User.findOne({ researchEntity: researchEntityId });
            if (user && !user.alreadyChangedProfile) {
                await User.update({ id: user.id }, { alreadyChangedProfile: true });
            }
        }
    } catch (e) {
        sails.log.debug(e);
    }

    // We merge the profile and errors object
    const profileWithErrors = _.merge({}, profile, errors);

    if (hasFiles) {
        const failedTasks = await runGruntTasks();

        if (failedTasks.length > 0) {
            message = 'Something went wrong while saving the image!';
        }
    }

    // We return an object with the profile, the error count and the message.
    return {
        profile: profileWithErrors,
        errors: errors,
        count: count,
        message: message
    };
}

/**
 * This function calls another function to export the profile depending on the type. This can be doc or PDF.
 *
 * @param {number}      researchEntityId
 * @param {string}      type
 * @param {Object}      options
 *
 * @returns {Promise<Base64String \ Error message>}
 */
async function exportProfile (researchEntityId, type, options = {}) {
    let result;
    switch(type) {
        case 'doc':
            result = await Profile.toDoc(researchEntityId, options);
            break;
        case 'pdf':
            result = await Profile.toPDF(researchEntityId, options);
            break;
        default:
            result = 'Wrong request!';
            break;
    }

    return result;
}

/**
 * Returns an array of failed tasks.
 * The task in this case is the copying of the profile images
 *
 * @returns {Array} tasks
 */
async function runGruntTasks() {
    const tasks = [];
    switch (sails.config.environment) {
        case 'development':
            tasks.push(await GruntTaskRunner.run('copy:profileDev'));
            break;
        case 'production':
            tasks.push(await GruntTaskRunner.run('copy:profileBuild'));
            break;
    }

    return tasks.filter(task => task.type !== 'success');
}