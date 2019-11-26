const Ajv = require('ajv');
const ajv = new Ajv({
    allErrors: true,
    removeAdditional: 'all',
    useDefaults: true
});
const defaults = require('json-schema-defaults');
const dot = require('dot-object');
// remove after debugging
const util = require('util')


const schema = {
    type: 'object',
    definitions: {
        onlyPrivacy: {
            type: 'object',
            properties : {
                public: {
                    type: 'boolean',
                    default : false
                }
            }
        },
        stringAndPrivacy: {
            type: 'object',
            properties : {
                value: {
                    type: 'string'
                },
                public: {
                    type: 'boolean',
                    default : false
                }
            },
            //required: ['value']
        },
        experience: {
            type: 'object',
            properties: {
                company: {
                    type: 'string'
                },
                jobTitle: {
                    type: 'string'
                },
                from: {
                    type: 'string',
                    //format: 'date'
                },
                to: {
                    type: 'string',
                    //format: 'date'
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
                public: {
                    type: 'boolean',
                    default: false
                }
            },
            required: ['company', 'jobTitle', 'location', 'country', 'jobDescription']
        },
        educationItem: {
            type: 'object',
            properties: {
                institute: {
                    type: 'string'
                },
                title: {
                    type: 'string'
                },
                from: {
                    type: 'string',
                    //format: 'date'
                },
                to: {
                    type: 'string',
                    //format: 'date'
                },
                location: {
                    type: 'string'
                },
                country: {
                    type: 'string'
                },
                public: {
                    type: 'boolean',
                    default: false
                }
            },
            required: ['institute', 'title', 'location', 'country']
        },
        certificate: {
            type: 'object',
            properties: {
                title: {
                    type: 'string'
                },
                description: {
                    type: 'string'
                },
                date: {
                    type: 'string',
                    //format: 'date'
                },
                public: {
                    type: 'boolean',
                    default: false
                }
            },
            required: ['title', 'description']
        }
    },
    properties : {
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
        facility: { $ref: '#/definitions/onlyPrivacy' },
        socials: {
            type: 'object',
            properties: {
                linkedin: { $ref: '#/definitions/stringAndPrivacy' },
                twitter: { $ref: '#/definitions/stringAndPrivacy' },
                facebook: { $ref: '#/definitions/stringAndPrivacy' },
                instagram: { $ref: '#/definitions/stringAndPrivacy' },
                researchgate: { $ref: '#/definitions/stringAndPrivacy' },
                github: { $ref: '#/definitions/stringAndPrivacy' },
                bitbucket: { $ref: '#/definitions/stringAndPrivacy' },
                youtube: { $ref: '#/definitions/stringAndPrivacy' },
                flickr: { $ref: '#/definitions/stringAndPrivacy' },
            }
        },
        displayNames: {
            type: 'object',
            properties: {
                use: {
                    type: 'boolean',
                    default: false
                },
                name: { $ref: '#/definitions/stringAndPrivacy' },
                surname: { $ref: '#/definitions/stringAndPrivacy' },
            }
        },
        titles: {
            type: 'array',
            items: { $ref: '#/definitions/stringAndPrivacy' },
            default: []
        },
        description: { $ref: '#/definitions/stringAndPrivacy' },
        role: { $ref: '#/definitions/stringAndPrivacy' },
        website: { $ref: '#/definitions/stringAndPrivacy' },
        address: { $ref: '#/definitions/stringAndPrivacy' },
        interests: { $ref: '#/definitions/stringAndPrivacy' },
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
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        //minLength: 5,
                        //maxLength: 1,
                    },
                    skills: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string'
                                },
                                public: {
                                    type: 'boolean',
                                    default: false
                                }
                            },
                            required: ['name']
                        },
                        default: []
                    },
                    public: {
                        type: 'boolean',
                        default: false
                    }
                },
                required: ['name']
            },
            default: []
        },
        publications: { $ref: '#/definitions/onlyPrivacy' },
        accomplishments: { $ref: '#/definitions/onlyPrivacy' },
    },
    required: ['description']
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
    async getEditProfile(researchEntityId) {
        const allGroups = await Group.find({ active: true });
        const researchEntityData = await ResearchEntityData.findOne({
            researchEntity: researchEntityId
        });

        let profile;
        if (researchEntityData && !_.isEmpty(researchEntityData.profile)) {
            profile = researchEntityData.profile;
        } else {
            profile = defaults(schema);
            //const validate = ajv.compile(schema);
            /*profile = defaults({
                type: 'object',
                definitions: validate.schema.definitions,
                properties: validate.schema.properties
            });*/
        }

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

            for (let i = 1; i < 7; i++) {
                if (!_.isEmpty(importedData['linea_' + i])) {
                    const code = importedData['linea_' + i];
                    const groups = allGroups.filter(group => group.code === code);
                    const group = groups.shift();

                    if (groups.length > 1) {
                        sails.log.debug('Multiple groups with the same code!');
                    }

                    if (group) {
                        switch (group.type) {
                            case 'Center':
                                break;
                            case 'Facility':
                                const facility = profile.facilities.filter(f => f.value === group.name).shift();
                                if (!facility) {
                                    facilities.push({
                                        value: group.name,
                                        public: false
                                    });
                                }

                                break;
                            case 'Institute':
                                const institute = profile.institutes.filter(f => f.value === group.name).shift();
                                if (!institute) {
                                    institutes.push({
                                        value: group.name,
                                        public: false
                                    });
                                }
                                break;
                            case 'Research Line':
                                const researchLine = profile.researchLines.filter(f => f.value === group.name).shift();
                                if (!researchLine) {
                                    researchLines.push({
                                        value: group.name,
                                        public: false
                                    });
                                }
                                const memberships = await MembershipGroup.find({
                                    child_group: group.researchEntity
                                });

                                for (let membership of memberships) {
                                    const membershipGroups = allGroups.filter(
                                        g => g.researchEntity === membership.parent_group && g.type === 'Center'
                                    );

                                    for (let membershipGroup of membershipGroups) {
                                        const center = profile.centers.filter(f => f.value === group.name).shift();
                                        if (!center) {
                                            centers.push({
                                                value: membershipGroup.name,
                                                public: false
                                            });
                                        }
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    } else {
                        sails.log.debug('Group not found! Code:' + code);
                    }
                }
            }

            if (centers.length > 0) {
                profile.centers = _.merge(profile.centers, centers);
            }

            if (facilities.length > 0) {
                profile.facilities = _.merge(profile.facilities, facilities);
            }

            if (researchLines.length > 0) {
                profile.researchLines = _.merge(profile.researchLines, researchLines);
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

        function filterProperties(object) {

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

                        // If the property is named 'public' or the property is empty  and not a boolean delete it.
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
        }

        profile = filterProperties(profile);

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

        // todo Change this
        //delete profile.publications;
        //delete profile.accomplishments;

        //sails.log.debug(util.inspect(profile, false, null, true));

        return profile;
    },
    async saveProfile(researchEntityId, profile) {
        let researchEntityData = await ResearchEntityData.findOne({
            researchEntity: researchEntityId
        });
        let message = 'Profile has been saved!';
        let errors = [];

        try {
            const validate = ajv.compile(schema);
            const valid = validate(profile);
            const row = {};
            if (validate.errors) {
                validate.errors.forEach(error => {
                    let path = error.dataPath;
                    path = path.substring(1);

                    if (error.keyword === 'required') {
                        path += '.' + error.params.missingProperty;
                    }

                    if (typeof row[path] === 'undefined') {
                        row[path] = [];
                    }

                    row[path].push({
                        keyword: error.keyword,
                        message: error.message
                    });
                });
                errors = dot.object(row);
                message = 'Please correct the errors!';
            }
        } catch (e) {
            sails.log.debug(e);
        }

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

        return {
            profile: profile,
            errors: errors,
            message: message
        };
    },
};