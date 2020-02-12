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
        privacyPublic: {
            type: 'object',
            properties: {
                privacy: {
                    type: 'string',
                    enum: ['public'],
                    default: 'public'
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
                    pattern: urlPattern,
                    default: ''
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
                categoryName: {
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
                    categoryName: emptyPatternMessage
                }
            },
            required: ['categoryName', 'privacy']
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
        username: { $ref: '#/definitions/privacyPublic' },
        name: { $ref: '#/definitions/privacyPublic' },
        surname: { $ref: '#/definitions/privacyPublic' },
        jobTitle: { $ref: '#/definitions/privacyPublic' },
        phone: { $ref: '#/definitions/privacyPublic' },
        centers: {
            type: 'array',
            items: { $ref: '#/definitions/privacyPublic' },
            default: []
        },
        researchLines: {
            type: 'array',
            items: { $ref: '#/definitions/privacyPublic' },
            default: []
        },
        directorate: { $ref: '#/definitions/privacyPublic' },
        office: { $ref: '#/definitions/privacyPublic' },
        facilities: {
            type: 'array',
            items: { $ref: '#/definitions/privacyPublic' },
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
        image: { $ref: '#/definitions/stringAndPrivacy' },
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
        hidden: {
            type: 'boolean',
            default: false
        },
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
        }
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
    filterProfile: filterProfile,
    handleDisplayNames: handleDisplayNames
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

            // Returns the value of the property if the object has a privacy and value property or the object has a
            // favorite, privacy and value property
            if (
                (Object.keys(object).length === 2 && _.has(object, 'privacy') && _.has(object, 'value')) ||
                (
                    Object.keys(object).length === 3 &&
                    _.has(object, 'favorite') &&
                    _.has(object, 'privacy') &&
                    _.has(object, 'value')
                )
            ) {
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

    if (
        (
            !onlyPublic &&
            _.has(profile, 'accomplishments.privacy') &&
            profile.accomplishments.privacy !== 'invisible'
        ) ||
        (onlyPublic && _.has(profile, 'accomplishments.privacy') && profile.accomplishments.privacy === 'public')
    ) {
        object.accomplishments = true;
    }

    if (
        (
            !onlyPublic &&
            _.has(profile, 'documents.privacy') &&
            profile.documents.privacy !== 'invisible'
        ) ||
        (onlyPublic && _.has(profile, 'documents.privacy') && profile.documents.privacy === 'public')
    ) {
        object.documents = true;
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
    const defaultProfile = defaults(schema);

    let profile = {};

    // We merge the defaults with the user's profile
    if (userData && !_.isEmpty(userData.profile)) {
        profile = _.merge(defaultProfile, userData.profile);
    } else {
        // We create a new profile with the defaults
        profile = _.cloneDeep(defaultProfile);
    }

    return profile;
}

/**
 * Returns the profile object with documents and accomplishments
 *
 * @param {Object} profile
 * @param {Integer} researchEntityId
 *
 * @returns {Object} profile
 */
async function loadDocumentsAndAccomplishments(profile, researchEntityId) {
    let accomplishments = [];
    let documents = [];

    const researchEntity = await ResearchEntity.findOne({id: researchEntityId});

    if (researchEntity && !researchEntity.isGroup()) {
        if (_.has(profile, 'accomplishments')) {
            const verifiedAccomplishments = await AccomplishmentVerify.find({researchEntity: researchEntityId});
            const accomplishmentIds = verifiedAccomplishments.map(a => a.accomplishment);

            // Check populates
            const accomplishmentPopulates = [
                'type',
                'authors',
                'affiliations',
                'institutes',
                'source',
                'verified',
                'verifiedUsers',
                'verifiedGroups'
            ];

            accomplishments = await Accomplishment.find(accomplishmentIds).populate(accomplishmentPopulates);
        }

        if (_.has(profile, 'documents')) {
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
                documents = await Document.find({
                    kind: DocumentKinds.VERIFIED, id: documentIds
                }).populate(documentPopulates);
            }
        }
    }

    if (!_.isEmpty(documents)) {
        profile.documents = documents;
    } else {
        delete profile.documents;
    }

    if (!_.isEmpty(accomplishments)) {
        profile.accomplishments = accomplishments;
    } else {
        delete profile.accomplishments;
    }

    return profile;
}

/**
 * Returns the profile object
 *
 * @param {Object} profile
 *
 * @returns {Object} profile
 */
function handleDisplayNames(profile) {
    // Overwrite the name and surname properties if the user wants to use display names
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

    return profile;
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
        return false;
    }

    // Filter the profile properties
    profile = filterProfile(profile);
    // Load the documents and accomplishments if needed
    profile = await loadDocumentsAndAccomplishments(profile, researchEntityId);
    // Replace the name and surname if the user wants to use the display names
    profile = handleDisplayNames(profile);

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
    let validate = {};
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
        // We compile our schema
        validate = ajv.compile(schema);

        // We validate the profile
        validate(profile);

        // After validating restore original basic information
        // If the profile is valid without any errors
        if (researchEntityData) {
            profile.username = researchEntityData.profile.username;
            profile.name = researchEntityData.profile.name;
            profile.surname = researchEntityData.profile.surname;
            profile.jobTitle = researchEntityData.profile.jobTitle;
            profile.phone = researchEntityData.profile.phone;
            profile.centers = researchEntityData.profile.centers;
            profile.researchLines = researchEntityData.profile.researchLines;
            profile.directorate = researchEntityData.profile.directorate;
            profile.office = researchEntityData.profile.office;
            profile.facilities = researchEntityData.profile.facilities;

            if (!hasFiles && !_.isEmpty(profile.image.value)) {
                profile.image.value = researchEntityData.profile.image.value;
            }
        }

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

            let name = profile.name.value;
            let surname = profile.surname.value;

            // Check if use display names is true
            if (profile.displayNames.use) {
                // Check if the display name are public or locked
                if (profile.displayNames.name.privacy === 'public' || profile.displayNames.name.privacy === 'locked') {
                    name = profile.displayNames.name.value;
                }

                // Check if the display surname are public or locked
                if (profile.displayNames.surname.privacy === 'public' || profile.displayNames.surname.privacy === 'locked') {
                    surname = profile.displayNames.surname.value;
                }
            }

            let user = await User.findOne({
                researchEntity: researchEntityId
            });

            if (user) {
                // Check if the user name and surname the same as the display names
                if (user.name !== name || user.surname !== surname) {

                    // Save into user's table
                    user = _.first(await User.update({
                        researchEntity: researchEntityId,
                    }, {
                        name,
                        surname
                    }));

                    try {
                        await User.createAliases(user);
                    } catch(e) {

                    }
                }
            }
        }
    } catch (e) {
        sails.log.debug(e);
    }

    // We merge the profile and errors object
    const profileWithErrors = {};
    _.merge(profileWithErrors, profile, errors);

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