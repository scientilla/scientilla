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
        privacy: {
            type: 'string',
            enum: ['locked', 'public', 'invisible'],
            default: 'locked'
        },
        onlyPrivacy: {
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
            required: ['privacy']
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
        username: { $ref: '#/definitions/onlyPrivacy' },
        name: { $ref: '#/definitions/onlyPrivacy' },
        surname: { $ref: '#/definitions/onlyPrivacy' },
        jobTitle: { $ref: '#/definitions/onlyPrivacy' },
        phone: { $ref: '#/definitions/onlyPrivacy' },
        centers: {
            type: 'array',
            items: { $ref: '#/definitions/onlyPrivacy' },
            default: []
        },
        researchLines: {
            type: 'array',
            items: { $ref: '#/definitions/onlyPrivacy' },
            default: []
        },
        administrativeOrganization: { $ref: '#/definitions/onlyPrivacy' },
        office: { $ref: '#/definitions/onlyPrivacy' },
        position: { $ref: '#/definitions/onlyPrivacy' },
        facilities: {
            type: 'array',
            items: { $ref: '#/definitions/onlyPrivacy' },
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
                    { $ref: '#/definitions/stringAndPrivacy' },
                    { required: ['value'] }
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
                    { $ref: '#/definitions/notEmptyStringAndPrivacy' },
                    { required: ['value'] }
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
        documents: { $ref: '#/definitions/onlyPrivacy' },
        accomplishments: { $ref: '#/definitions/onlyPrivacy' },
    }
};

/*function filterProperties(object) {

    // Loop over the properties of the object
    for (const property in object) {

        // Check which type the object is
        switch(true) {
            case _.isArray(object[property]) :
                // If it's an Array loop over the items
                const len = object[property].length;

                if (len > 0) {
                    for (let i = 0;i < len; i++) {
                        const filteredProperty = filterProperties(object[property][i]);

                        // Set the object property to the filteredProperty or remove it from the array
                        if (!_.isEmpty(filteredProperty)) {
                            object[property][i] = filteredProperty;
                        } else {
                            delete object[property].splice(i, 1);
                        }
                    }
                } else {
                    delete object[property];
                }

                break;
            case _.isObject(object[property]):

                const filteredProperty = filterProperties(object[property]);

                // Set the object property to the filteredProperty or delete it
                if (!_.isEmpty(filteredProperty)) {
                    object[property] = filteredProperty;
                } else {
                    delete object[property];
                }

                break;
            default:
                // If it's not an Array or an Object

                // If it has a property named 'value' return that.
                if (property === 'value') {
                    return object[property];
                }

                // If the property is named 'public' or the property is empty and not a boolean delete it.
                if (
                    (property === 'public') ||
                    (typeof object[property] !== 'boolean' && _.isEmpty(object[property]))
                ) {
                    delete object[property];
                }

                break;
        }
    }
    return object;
}*/
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



            /*if (_.has(object, 'public') && object['public'] === false) {

            }*/

            /*for (const property in object) {
                sails.log.debug(property);
            }*/

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
    async getEditProfile(researchEntityId) {
        const allGroups = await Group.find({ active: true });
        const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
        const researchEntityData = await ResearchEntityData.findOne({
            researchEntity: researchEntityId
        });
        const defaultProfile = defaults(schema);

        //sails.log.debug(defaultProfile);

        let profile = {};
        if (researchEntityData && !_.isEmpty(researchEntityData.profile)) {
            //profile = researchEntityData.profile;
            profile = _.merge(defaultProfile, researchEntityData.profile);
        } else {
            profile = _.cloneDeep(defaultProfile);
            //const validate = ajv.compile(schema);
            /*profile = defaults({
                type: 'object',
                definitions: validate.schema.definitions,
                properties: validate.schema.properties
            });*/
        }

        //sails.log.debug(profile);

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
                        sails.log.debug(util.inspect(group, false, null, true));
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
                        sails.log.debug(util.inspect(group, false, null, true));
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

            if (!_.isEmpty(accomplishments)) {
                profile.accomplishments = accomplishments;
            }

            const user = await User.findOne({researchEntity: researchEntityId}).populate('documents');
            if (!_.isEmpty(user.documents)) {

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
            }
        }

        return profile;
    },
    async saveProfile(researchEntityId, profile) {
        sails.log.debug(util.inspect(profile, false, null, true));
        let researchEntityData = await ResearchEntityData.findOne({
            researchEntity: researchEntityId
        });
        let message = 'Profile has been saved!';
        let errors = [];

        try {
            const validate = ajv.compile(schema);
            validate(profile);
            //sails.log.debug(util.inspect(validate, false, null, true));
            sails.log.debug(util.inspect(profile, false, null, true));
            //sails.log.debug(util.inspect(validate.errors, false, null, true));
            if (validate.errors) {

                const row = {};

                for (let i = 0; i < validate.errors.length; i++) {
                    let error = validate.errors[i];

                    if (error.keyword === 'if') {
                        continue;
                    }

                    let path = error.dataPath.substring(1).replace(/\//g, '.');

                    if (error.keyword === 'required') {
                        path += '.' + error.params.missingProperty;
                        error.message = requiredMessage;
                    }

                    if (typeof row[path] === 'undefined') {
                        row[path] = [];
                    }

                    row[path].push({
                        keyword: error.keyword,
                        message: error.message
                    });
                }

                errors = dot.object(row);

                message = 'Please correct the errors!';
            } else {
                if (researchEntityData) {
                    const response = await ResearchEntityData.update(
                        { id: researchEntityData.id },
                        { profile: profile }
                    );
                    researchEntityData = response[0];
                } else {
                    researchEntityData = await ResearchEntityData.create({
                        researchEntity: researchEntityId,
                        profile: profile
                    });
                }
            }
        } catch (e) {
            sails.log.debug(e);
        }

        return {
            errors: errors,
            message: message
        };
    },
    async exportProfile (researchEntityId, type) {
        let result;
        switch(type) {
            case 'doc':
                result = await Profile.toDoc(researchEntityId);
                break;
            case 'pdf':
                result = await Profile.toPDF(researchEntityId);
                break;
            default:
                result = 'Wrong request!';
                break;
        }

        return result;
    }
};