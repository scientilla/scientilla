const Ajv = require('ajv');
const ajv = new Ajv({
    allErrors: true,
    removeAdditional: 'all',
    useDefaults: true,
    jsonPointers: true
});
require('ajv-errors')(ajv);

const defaults = require('json-schema-defaults');
const dot = require('dot-object');
// remove after debugging
const util = require('util');


const requiredDatePattern = '^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2})\\:(\\d{2})\\:(\\d{2})\\.(\\d{3})Z';
const requiredMessage = 'This field is required.';

const datePattern = '^$|' + requiredDatePattern;
const datePatternMessage = 'This should be a valid date.';

const urlPattern = '^$|^(http|https)://';
const urlPatternMessage = 'This should be a valid URL starting with http:// or https://';

const emptyPattern = '([^\\s])';
const emptyPatternMessage = requiredMessage;

const defaultPrivacy = 'locked';

const schema = {
    type: 'object',
    definitions: {
        privacyLockedPublicInvisible: {
            type: 'object',
            properties: {
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                },
            }
        },
        privacyLockedPublic: {
            type: 'object',
            properties: {
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public'],
                    default: 'locked'
                },
            }
        },
        stringAndPrivacy: {
            type: 'object',
            properties: {
                value: {
                    type: 'string'
                },
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                }
            },
            required: ['privacy']
        },
        notEmptyStringAndPrivacy: {
            type: 'object',
            properties: {
                value: {
                    pattern: emptyPattern
                },
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                }
            },
            errorMessage: {
                properties:{
                    value: emptyPatternMessage
                }
            },
            required: ['value', 'privacy']
        },
        urlAndPrivacy: {
            type: 'object',
            properties: {
                value: {
                    pattern: urlPattern
                },
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                }
            },
            errorMessage: {
                properties:{
                    value: urlPatternMessage
                }
            },
            required: ['privacy']
        },
        experience: {
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
                },
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                }
            },
            errorMessage: {
                properties:{
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
                },
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                }
            },
            errorMessage: {
                properties:{
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
                },
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                }
            },
            errorMessage: {
                properties:{
                    title: requiredMessage,
                    date: datePatternMessage
                }
            },
            required: ['title', 'favorite']
        },
        skillCategory: {
            type: 'object',
            properties: {
                value: {
                    pattern: emptyPattern
                },
                skills: {
                    type: 'array',
                    items: { $ref: '#/definitions/skill' },
                    default: []
                },
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                }
            },
            errorMessage: {
                properties:{
                    value: emptyPatternMessage
                }
            },
            required: ['value', 'privacy']
        },
        skill: {
            type: 'object',
            properties: {
                value: {
                    pattern: emptyPattern
                },
                favorite: {
                    type: 'boolean',
                    default: false
                },
                privacy: {
                    type: 'string',
                    enum: ['locked', 'public', 'invisible'],
                    default: 'locked'
                }
            },
            errorMessage: {
                properties:{
                    value: emptyPatternMessage
                }
            },
            required: ['value', 'favorite', 'privacy']
        }
    },
    properties: {
        username: { $ref: '#/definitions/privacyLockedPublic' },
        name: { $ref: '#/definitions/privacyLockedPublic' },
        surname: { $ref: '#/definitions/privacyLockedPublic' },
        jobTitle: { $ref: '#/definitions/privacyLockedPublic' },
        phone: { $ref: '#/definitions/privacyLockedPublic' },
        centers: {
            type: 'array',
            items: { $ref: '#/definitions/privacyLockedPublic' },
            default: []
        },
        researchLines: {
            type: 'array',
            items: { $ref: '#/definitions/privacyLockedPublic' },
            default: []
        },
        administrativeOrganization: { $ref: '#/definitions/privacyLockedPublic' },
        office: { $ref: '#/definitions/privacyLockedPublic' },
        position: { $ref: '#/definitions/privacyLockedPublic' },
        facilities: {
            type: 'array',
            items: { $ref: '#/definitions/privacyLockedPublic' },
            default: []
        },
        socials: {
            type: 'object',
            properties: {
                linkedin: { $ref: '#/definitions/urlAndPrivacy' },
                twitter: { $ref: '#/definitions/urlAndPrivacy' },
                facebook: { $ref: '#/definitions/urlAndPrivacy' },
                instagram: { $ref: '#/definitions/urlAndPrivacy' },
                researchgate: { $ref: '#/definitions/urlAndPrivacy' },
                github: { $ref: '#/definitions/urlAndPrivacy' },
                bitbucket: { $ref: '#/definitions/urlAndPrivacy' },
                youtube: { $ref: '#/definitions/urlAndPrivacy' },
                flickr: { $ref: '#/definitions/urlAndPrivacy' },
            }
        },
        displayNames: {
            type: 'object',
            properties: {
                use: {
                    type: 'boolean',
                    default: false
                },
                name: {$ref: '#/definitions/stringAndPrivacy'},
                surname: {$ref: '#/definitions/stringAndPrivacy'},
            },
            required: ['use'],
            if: {
                properties: {
                    use: {
                        type: 'boolean',
                        const: true
                    },
                    name: {$ref: '#/definitions/stringAndPrivacy'},
                    surname: {$ref: '#/definitions/stringAndPrivacy'},
                },
                required: ['use']
            },
            then: {
                properties: {
                    use: {
                        type: 'boolean',
                        default: false
                    },
                    name: { $ref: '#/definitions/notEmptyStringAndPrivacy' },
                    surname: { $ref: '#/definitions/notEmptyStringAndPrivacy' },
                },
                required: ['use', 'name', 'surname']
            },
            else: {
                properties: {
                    use: {
                        type: 'boolean',
                        default: false
                    },
                    name: {$ref: '#/definitions/stringAndPrivacy'},
                    surname: {$ref: '#/definitions/stringAndPrivacy'},
                },
                required: ['use', 'name', 'surname']
            }
        },
        titles: {
            type: 'array',
            items: {
                allOf: [
                    { $ref: '#/definitions/notEmptyStringAndPrivacy' }
                ]
            },
            default: []
        },
        description: { $ref: '#/definitions/stringAndPrivacy' },
        role: { $ref: '#/definitions/stringAndPrivacy' },
        website: { $ref: '#/definitions/urlAndPrivacy' },
        address: { $ref: '#/definitions/stringAndPrivacy' },
        interests: {
            type: 'array',
            items: {
                allOf: [
                    { $ref: '#/definitions/notEmptyStringAndPrivacy' }
                ]
            },
            default: []
        },
        experiences: {
            type: 'array',
            items: { $ref: '#/definitions/experience' },
            default: []
        },
        education: {
            type: 'array',
            items: { $ref: '#/definitions/educationItem' },
            default: []
        },
        certificates: {
            type: 'array',
            items: { $ref: '#/definitions/certificate' },
            default: []
        },
        skillCategories: {
            type: 'array',
            items: { $ref: '#/definitions/skillCategory' },
            default: []
        },
        documents: { $ref: '#/definitions/privacyLockedPublicInvisible' },
        accomplishments: { $ref: '#/definitions/privacyLockedPublicInvisible' },
    }
};

function filterProperty(object) {
    switch(true) {
        case _.isArray(object) :

            const len = object.length;

            if (len > 0) {
                const array = [];
                for (let i = 0; i < len; i++) {
                    const filteredProperty = filterProperty(object[i]);
                    if (filteredProperty) {
                        array.push(filteredProperty);
                    }
                }

                if (array.length > 0) {
                    return array;
                }
            }

            return false;
        case _.isObject(object) :

            if (_.has(object, 'privacy') && object['privacy'] === 'invisible') {
                return false;
            }

            if (Object.keys(object).length === 2 && _.has(object, 'privacy') && _.has(object, 'value')) {
                return object['value'];
            }

            if (_.has(object, 'privacy')) {
                delete object['privacy'];
            }

            const tmpObject = {};
            for (const property in object) {
                const filteredProperty = filterProperty(object[property]);
                if (filteredProperty) {
                    tmpObject[property] = filteredProperty;
                }
            }

            if (!_.isEmpty(tmpObject)) {
                return tmpObject;
            }

            return false;

            break;
        default:
            return object;
    }
}

function filterProfile(profile) {

    const object = {};
    // Loop over the properties of the object
    for (const property in profile) {
        const filteredProperty = filterProperty(profile[property]);
        if (filteredProperty) {
            object[property] = filteredProperty
        }
    }
    return object;
}

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

    /**
     * This function return the profile of the research entity with the editable values.
     *
     * @param {number}      researchEntityId
     *
     * @returns {Object}
     */
    async getEditProfile(researchEntityId) {

        // We cache the groups, membership groups and default profile.
        const allGroups = await Group.find({ active: true });
        const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
        const defaultProfile = defaults(schema);

        // We search if there is already a record for this research entity.
        const researchEntityData = await ResearchEntityData.findOne({
            researchEntity: researchEntityId
        });

        let profile = {};

        // We use the existing profile or create a profile object with the defaults.
        if (researchEntityData && !_.isEmpty(researchEntityData.profile)) {
            profile = _.merge(defaultProfile, researchEntityData.profile);
        } else {
            profile = _.cloneDeep(defaultProfile);
        }

        // We add the imported data fron Pentaho into the profile.
        if (researchEntityData && researchEntityData.imported_data) {
            const importedData = _.cloneDeep(researchEntityData.imported_data);

            profile.username.value = importedData.email;
            profile.name.value = importedData.nome;
            profile.surname.value = importedData.cognome;
            profile.phone.value = importedData.telefono;
            profile.jobTitle.value = importedData.Ruolo_AD;

            const centers = [];
            const facilities = [];
            const researchLines = [];
            const institutes = [];

            function handleGroup (group) {
                switch (group.type) {
                    case 'Center':
                        const center = centers.find(c => c.value === group.name);
                        if (!center) {
                            centers.push({
                                value: group.name,
                                privacy: defaultPrivacy
                            });
                        }
                        break;
                    case 'Facility':
                        const facility = facilities.find(f => f.value === group.name);
                        if (!facility) {
                            facilities.push({
                                value: group.name,
                                privacy: defaultPrivacy
                            });
                        }
                        break;
                    case 'Institute':
                        const institute = institutes.find(i => i.value === group.name);
                        if (!institute) {
                            institutes.push({
                                value: group.name,
                                privacy: defaultPrivacy
                            });
                        }
                        break;
                    case 'Research Line':
                        const researchLine = researchLines.find(f => f.value === group.name);
                        if (!researchLine) {
                            researchLines.push({
                                value: group.name,
                                privacy: defaultPrivacy
                            });
                        }
                        break;
                    default:
                        break;
                }

                const membershipGroup = allMembershipGroups.find(g => g.child_group === group.id && g.parent_group.active);

                if (membershipGroup) {
                    handleGroup(membershipGroup.parent_group);
                }
            }

            for (let i = 1; i < 7; i++) {
                if (!_.isEmpty(importedData['linea_' + i])) {
                    const code = importedData['linea_' + i];
                    const group = allGroups.find(group => group.code === code);

                    if (group) {
                        handleGroup(group);
                    } else {
                        sails.log.debug('Group not found! Code:' + code);
                    }
                }
            }

            if (centers.length > 0) {
                profile.centers = _.merge(centers, profile.centers);
            }

            if (facilities.length > 0) {
                profile.facilities = _.merge(facilities, profile.facilities);
            }

            if (researchLines.length > 0) {
                profile.researchLines = _.merge(researchLines, profile.researchLines);
            }

            if (facilities.length === 0 && researchLines.length === 0) {
                profile.office.value = importedData.UO_1;
                profile.administrativeOrganization.value = importedData.nome_linea_1;
            }
        }

        return profile;
    },
    /**
     * This function return the profile of the research entity
     *
     * @param {number}      researchEntityId
     *
     * @returns {Object}
     */
    async getProfile(researchEntityId) {
        const editProfile = await this.getEditProfile(researchEntityId);

        let profile = _.cloneDeep(editProfile);

        profile = filterProfile(profile);

        if (_.has(profile, 'displayNames')) {
            if (_.has(profile.displayNames, 'use') === true) {
                if (profile.displayNames.name && !_.isEmpty(profile.displayNames.name)) {
                    profile.name = profile.displayNames.name;
                }

                if (profile.displayNames.surname && !_.isEmpty(profile.displayNames.surname)) {
                    profile.surname = profile.displayNames.surname;
                }
            }

            delete profile.displayNames;
        }

        const researchEntity = await ResearchEntity.findOne({id: researchEntityId});
        if (researchEntity && !researchEntity.isGroup()) {

            const verifiedAccomplishments = await AccomplishmentVerify.find({researchEntity: researchEntityId});
            const accomplishmentIds = verifiedAccomplishments.map(a => a.accomplishment);

            // Check populates
            const accomplishmentPopulates = ['type', 'authors', 'affiliations', 'institutes', 'source', 'verifiedUsers', 'verifiedGroups'];
            const accomplishments = await Accomplishment.find(accomplishmentIds).populate(accomplishmentPopulates);

            if (!_.isEmpty(accomplishments) && editProfile.accomplishments.privacy !== 'invisible') {
                profile.accomplishments = accomplishments;
            } else {
                delete profile.accomplishments;
            }

            const user = await User.findOne({researchEntity: researchEntityId}).populate('documents');
            if (!_.isEmpty(user.documents) && editProfile.documents.privacy !== 'invisible') {

                const documentIds = user.documents.map(d => d.id);

                // Check populates
                const documentPopulates = [
                    'source',
                    'authors',
                    'authorships',
                    'groupAuthorships',
                    'affiliations',
                    'sourceMetrics',
                    'userTags',
                    'tagLabels',
                    'groupTags',
                    'groupTagLabels',
                    'institutes',
                    //'duplicates',
                    'groups',
                    'scopusDocumentMetadata',
                    'openaireMetadata'
                ];
                profile.documents = await Document.find({kind: DocumentKinds.VERIFIED, id: documentIds}).populate(documentPopulates);
            } else {
                delete profile.documents;
            }
        } else {
            delete profile.documents;
            delete profile.accomplishments;
        }

        return profile;
    },

    /**
     * This function tries to save the profile into the database.
     *
     * First it checks if the passed profile is valid.
     * If that's the case it will be saved in a new record or existing record.
     *
     * The function returns the profile with the errors (if that's is the case), number of errors and related message
     *
     * @param {number}      researchEntityId
     * @param {string}      profile
     *
     * @returns {Object}
     */
    async saveProfile(researchEntityId, profile) {

        // Some defaults
        let message = 'Profile has been saved!';
        let errors = [];
        let validate = {};
        let count = 0;

        // We look for ResearchEntityData by the researchEntittyId
        let researchEntityData = await ResearchEntityData.findOne({
            researchEntity: researchEntityId
        });

        try {
            // We compile our schema
            validate = ajv.compile(schema);

            // We validate the profile
            validate(profile);

            // If the profile has some errors
            if (validate.errors) {

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
                    const response = await ResearchEntityData.update(
                        { id: researchEntityData.id },
                        { profile: profile }
                    );
                    researchEntityData = response[0];
                } else {
                    // If there isn't any record yet, we create one for this researchEntity and save the profile.
                    researchEntityData = await ResearchEntityData.create({
                        researchEntity: researchEntityId,
                        profile: profile
                    });
                }
            }
        } catch (e) {
            sails.log.debug(e);
        }

        // We merge the profile and errors object
        const profileWithErrors = {};
        _.merge(profileWithErrors, profile, errors);

        // We return an object with the profile, the error count and the message.
        return {
            profile: profileWithErrors,
            errors: errors,
            count: count,
            message: message
        };
    },

    /**
     * This function calls another function to export the profile depending on the type. This can be doc or PDF.
     *
     * @param {number}      researchEntityId
     * @param {string}      type
     * @param {Object}      options
     *
     * @returns {Promise<Base64String \ Error message>}
     */
    async exportProfile (researchEntityId, type, options = {}) {
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
};