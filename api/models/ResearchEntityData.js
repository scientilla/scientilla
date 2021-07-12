/* global RoleAssociations */

const dot = require('dot-object');

const moment = require('moment');
moment.locale('en');
const ISO8601Format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const JsonValidator = require('../services/JsonValidator');
const util = require('util');

const pathProfileImages = path.join('profile', 'images');

const validateProfile = JsonValidator.getProfileValidator();
const validateProfileRemoveAdditional = JsonValidator.getProfileRemoveAdditionalValidator();

const requiredMessage = 'This field is required.';

module.exports = {
    attributes: {
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
        importedData: {
            type: 'JSON',
            columnName: 'imported_data'
        },
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
 * @param {Object} researchEntityData
 *
 * @returns {Object} profile
 */
function setupProfile(researchEntityData) {
    // We store the defaults of the research entity data schema.
    const defaultProfile = JsonValidator.getDefaultProfile();
    const privacyDefault = _.has(researchEntityData, 'profile.hidden') && researchEntityData.profile.hidden ? 'hidden' : 'public';

    if (!_.has(researchEntityData, 'importedData') || _.isNil(researchEntityData.importedData)) {
        return;
    }

    // We merge the defaults with the user's profile
    if (researchEntityData && !_.isEmpty(researchEntityData.profile)) {

        if (!_.has(researchEntityData.profile, 'roleCategory.value') || _.isEmpty(researchEntityData.profile.roleCategory.value)) {
            researchEntityData.profile.roleCategory = {};
            researchEntityData.profile.roleCategory.privacy = 'public';
            researchEntityData.profile.roleCategory.value = researchEntityData.importedData.Ruolo_1;
        }

        const associations = RoleAssociations.get();
        const association = associations.find(a => a.originalRole === researchEntityData.profile.roleCategory.value);
        if (association) {
            researchEntityData.profile.roleCategory.value = association.roleCategory;
        } else {
            researchEntityData.profile.roleCategory.value = '';
        }

        if (_.has(researchEntityData.profile, 'experiencesExternal') || _.has(researchEntityData.profile, 'experiencesInternal')) {

            switch (true) {
                case _.has(researchEntityData.profile, 'experiencesExternal') && _.has(researchEntityData.profile, 'experiencesInternal') :
                    researchEntityData.profile.experiences = researchEntityData.profile.experiencesExternal.concat(researchEntityData.profile.experiencesInternal);
                    break;
                case !_.has(researchEntityData.profile, 'experiencesExternal') && _.has(researchEntityData.profile, 'experiencesInternal') :
                    researchEntityData.profile.experiences = researchEntityData.profile.experiencesInternal;
                    break;
                case _.has(researchEntityData.profile, 'experiencesExternal') && !_.has(researchEntityData.profile, 'experiencesInternal') :
                    researchEntityData.profile.experiences = researchEntityData.profile.experiencesExternal;
                    break;
                default:
                    researchEntityData.profile.experiences = [];
                    break;
            }

            researchEntityData.profile.experiencesExternal = _.orderBy(
                researchEntityData.profile.experiencesExternal,
                [
                    experience => new moment(experience.from, ISO8601Format),
                    experience => new moment(experience.to, ISO8601Format)
                ],
                [
                    'desc',
                    'desc'
                ]
            );

            researchEntityData.profile.experiencesInternal = _.orderBy(
                researchEntityData.profile.experiencesInternal,
                [
                    experience => new moment(experience.from, ISO8601Format),
                    experience => new moment(experience.to, ISO8601Format)
                ],
                [
                    'desc',
                    'desc'
                ]
            );

            researchEntityData.profile.experiences = _.orderBy(
                researchEntityData.profile.experiences,
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

        if (_.has(researchEntityData, 'profile.gender.value')) {
            researchEntityData.profile.gender.value = researchEntityData.importedData.genere;
            researchEntityData.profile.gender.privacy = privacyDefault;
        } else {
            researchEntityData.profile.gender = {
                value: researchEntityData.importedData.genere,
                privacy: privacyDefault
            }
        }

        return _.merge({}, defaultProfile, researchEntityData.profile);
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
        const filePath = path.resolve(sails.config.appPath, imagePath);

        await new Promise(function (resolve, reject) {

            let filename = req.file('profileImage')._files[0].stream.filename;
            const originalImage = path.join(filePath, filename);

            const widthSmall = 200;
            const heightSmall = 200;
            const prefixSmall = `${widthSmall}x${heightSmall}_`;
            const croppedImageSmall = path.join(filePath, prefixSmall + filename);

            const widthBig = 600;
            const heightBig = 600;
            const prefixBig = `${widthBig}x${heightBig}_`;
            const croppedImageBig = path.join(filePath, prefixBig + filename);

            newProfileImageSmall = prefixSmall + filename;
            newProfileImageBig = prefixBig + filename;

            req.file('profileImage').upload({
                dirname: filePath,
                saveAs: filename
            }, async function (err, files) {
                if (err) {
                    reject(err);
                }

                await sharp(originalImage)
                    .resize(widthSmall, heightSmall)
                    .toFile(croppedImageSmall);

                await sharp(originalImage)
                    .resize(widthBig, heightBig)
                    .toFile(croppedImageBig);

                if (files.length > 0) {
                    let src = files[0].fd.split('/');
                    src = src[src.length - 1];

                    profile.image.value = prefixBig + src;
                }

                resolve();
            });
        });

        const readdir = util.promisify(fs.readdir);
        const files = await readdir(filePath);
        const unlink = util.promisify(fs.unlink);

        // Remove all other profile images
        for (const file of files) {
            if (![newProfileImageSmall, newProfileImageBig].includes(file)) {
                await unlink(path.join(filePath, file));
            }
        }
    }

    try {
        if (researchEntityData) {
            profile.hidden = researchEntityData.profile.hidden;
        } else {
            profile.hidden = false;
        }

        profile.remove = true;

        const valid = validateProfile(profile);

        // Run the validator again to remove all the additional properties
        validateProfileRemoveAdditional(profile);

        // After validating restore original basic information
        // If the profile is valid without any errors
        if (researchEntityData) {
            profile.username = researchEntityData.profile.username;
            profile.name = researchEntityData.profile.name;
            profile.surname = researchEntityData.profile.surname;
            profile.jobTitle = researchEntityData.profile.jobTitle;
            profile.roleCategory = researchEntityData.profile.roleCategory;
            profile.phone = researchEntityData.profile.phone;
            profile.gender = researchEntityData.profile.gender;
            profile.nationality = researchEntityData.profile.nationality;
            profile.dateOfBirth = researchEntityData.profile.dateOfBirth;
            profile.groups = researchEntityData.profile.groups;

            if (!hasFiles && _.has(profile, 'image.value') && !_.isEmpty(profile.image.value)) {
                profile.image.value = researchEntityData.profile.image.value;
            }

            profile.experiencesInternal = researchEntityData.profile.experiencesInternal;
            profile.hidden = researchEntityData.profile.hidden;
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

        // If the profile has some errors
        if (!valid || validateProfile.errors) {

            const row = {};

            // We loop over the validation errors and group the error messages for each field
            for (let i = 0; i < validateProfile.errors.length; i++) {
                let error = validateProfile.errors[i];

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
            if (user && !user.already_changed_profile) {
                await User.update({ id: user.id }, { already_changed_profile: true });
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