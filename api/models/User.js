/* global User, Group, Document, sails, Auth, Authorship, SqlService, Alias */
'use strict';

/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 * @docs        :: http://waterlock.ninja/documentation
 */

const assert = require('assert');
const _ = require('lodash');
const waterlock = require('waterlock');
const Promise = require("bluebird");
const ResearchEntity = require('../lib/ResearchEntity');

const USER = 'user';
const ADMINISTRATOR = 'administrator';

module.exports = _.merge({}, ResearchEntity, {
    DEFAULT_SORTING: {
        surname: 'asc',
        name: 'asc',
        updatedAt: 'desc'
    },
    USER: USER,
    ADMINISTRATOR: ADMINISTRATOR,
    searchKey: 'username',
    attributes: require('waterlock').models.user.attributes({
        //Constants
        username: {
            type: 'email',
            defaultsTo: ""
        },
        name: {
            type: 'STRING',
            defaultsTo: ""
        },
        surname: {
            type: 'STRING',
            defaultsTo: ""
        },
        slug: {
            type: 'STRING',
            unique: true,
            alphanumericdashed: true,
            minLength: 3,
            maxLength: 30,
            defaultsTo: ""
        },
        alreadyAccess: {
            type: "BOOLEAN",
            defaultsTo: false
        },
        alreadyOpenedSuggested: {
            type: "BOOLEAN",
            defaultsTo: false
        },
        role: {
            type: 'STRING',
            enum: [USER, ADMINISTRATOR],
            defaultsTo: USER
        },
        orcidId: {
            type: 'STRING'
        },
        scopusId: {
            type: 'STRING'
        },
        jobTitle: {
            type: 'STRING'
        },
        drafts: {
            collection: 'Document',
            via: 'draftCreator'
        },
        documents: {
            collection: 'Document',
            via: 'users',
            through: 'authorship'
        },
        publicDocuments: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'publicauthorship'
        },
        disseminationTalks: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'disseminationtalk'
        },
        scientificTalks: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'scientifictalk'
        },
        publications: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'publication'
        },
        suggestedDocuments: {
            collection: 'Document',
            via: 'users',
            through: 'documentsuggestion'
        },
        externalDocuments: {
            collection: 'document',
            via: 'researchEntity',
            through: 'externaldocument'
        },
        authorships: {
            collection: 'authorship',
            via: 'researchEntity',
        },
        discardedDocuments: {
            collection: 'Document',
            via: 'discardedCoauthors',
            through: 'discarded'
        },
        jsonWebTokens: {
            collection: 'jwt',
            via: 'owner'
        },
        collaborations: {
            collection: 'collaboration',
            via: 'user'
        },
        aliases: {
            collection: 'alias',
            via: 'user'
        },
        administratedGroups: {
            collection: 'group',
            via: 'administrators',
            through: 'groupadministrator'
        },
        memberships: {
            collection: 'Group',
            via: 'members',
            through: 'membership'
        },
        attributes: {
            collection: 'Attribute',
            through: 'userattribute'
        },
        getAliases: async function () {
            const aliases = await Alias.find({user: this.id});
            return aliases.map(a => a.str);
        },
        getType: function () {
            return 'user';
        }
    }),
    getAdministeredGroups: function (userId) {
        return User.findOneById(userId)
            .populate('administratedGroups')
            .then(function (user) {
                return user.administratedGroups;
            });
    },
    setSlug: async function (user) {
        const basicSlug = user.username.toLowerCase().trim().replace(/\./gi, '-').split('@')[0];

        let slug = basicSlug;
        while (true) {
            const otherUserBySlug = await User.findOneBySlug(slug);
            if (!otherUserBySlug)
                break;
            slug = basicSlug + _.random(1, 999);
        }

        user.slug = slug;
        return user;
    },
    createCompleteUser: async function (params) {
        params.username = _.toLower(params.username);
        const attributes = _.keys(User._attributes);
        const userObj = _.pick(params, attributes);
        await User.checkUsername(userObj);
        const user = await User.create(userObj);
        const authAttributes = _.keys(Auth._attributes);
        const auth = _.pick(params, authAttributes);
        return new Promise(function (resolve, reject) {
            waterlock.engine.attachAuthToUser(auth, user,
                function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(user);
                });
        });

        return Promise.resolve(userObj)
            .then(User.checkUsername)
            .then(User.create)
            .then(function (user) {
                var authAttributes = _.keys(Auth._attributes);
                var auth = _.pick(params, authAttributes);
                return new Promise(function (resolve, reject) {
                    waterlock.engine.attachAuthToUser(auth, user,
                        function (err) {
                            if (err)
                                reject(err);
                            else
                                resolve(user);
                        });
                });
            });
    },
    registerUser: function (user) {
        if (User.isInternalUser(user)) {
            const err = 'Cannot create domain users';
            throw err;
        }
        return User.createCompleteUser(user);
    },
    setNewUserRole: function (user) {
        return User
            .count()
            .then(function (usersNum) {
                usersNum === 0 ? user.role = ADMINISTRATOR : user.role = USER;
                return user;
            });
    },
    checkUsername: async function (user) {
        const sameUsernameUsers = await User.findByUsername(user.username);
        if (sameUsernameUsers.length > 0)
            throw new Error('Username already used');
    },
    createAliases: async function (user) {
        function capitalizeAll(str, wordSeparators) {
            function capitalize(str) {
                return str.charAt(0).toLocaleUpperCase() + str.slice(1);
            }

            let retStr = str.toLocaleLowerCase();
            for (const c of wordSeparators)
                retStr = retStr.split(c).map(capitalize).join(c);
            return retStr
        }

        const separators = [' ', '-', '.'];
        const nameInitials = user.name.split(' ').map(n => n[0]).join('.') + '.';
        const alias1 = capitalizeAll(user.surname + ' ' + nameInitials, separators);
        const alias2 = capitalizeAll(user.surname.replace(' ', '-') + ' ' + nameInitials, separators);

        const aliases = [];
        aliases.push({
            user: user.id,
            str: alias1
        });
        if (alias1 !== alias2)
            aliases.push({
                user: user.id,
                str: alias2
            });

        await Alias.create(aliases);
    },
    copyAuthData: function (user) {
        if (!user.auth)
            return user;

        return Auth
            .findOneById(user.auth)
            .then(function (auth) {
                user.username = auth.username;
                user.name = auth.name;
                user.surname = auth.surname;

                return user;
            });

    },
    getAuthorshipsData: async function (document, researchEntityId, newAffiliationData = {}) {
        const user = await User.findOneById(researchEntityId);

        if (!user)
            return {
                isVerifiable: false,
                error: 'User not found',
                item: researchEntityId
            };

        const position = !_.isNil(newAffiliationData.position) ? newAffiliationData.position : await document.getAuthorIndex(user);
        const authorship = document.getAuthorshipByPosition(position) || Authorship.getEmpty();
        //TODO: [Accrocchio] remove when deep populate is added to waterline
        assert(!_.isNil(document.affiliations), 'getAuthorshipAffiliations: affiliations missing');

        const affiliations = document.affiliations
            .filter(a => a.authorship == authorship.id)
            .map(a => a.institute);
        //[/Accrocchio]

        const affiliationInstituteIds = !_.isEmpty(newAffiliationData.affiliationInstituteIds) ? newAffiliationData.affiliationInstituteIds : affiliations;
        const corresponding = !_.isNil(newAffiliationData.corresponding) ? newAffiliationData.corresponding : authorship.corresponding;
        const synchronize = !_.isNil(newAffiliationData.synchronize) ? newAffiliationData.synchronize : document.synchronized;
        const publicDocument = !_.isNil(newAffiliationData.public) ? newAffiliationData.public : true;

        if (_.isEmpty(affiliationInstituteIds) || _.isNil(position))
            return {
                isVerifiable: false,
                error: "Document Verify fail: affiliation or position not specified",
                document: document
            };


        return {
            isVerifiable: true,
            position,
            affiliationInstituteIds,
            corresponding,
            synchronize,
            public: publicDocument,
            document
        };
    },
    doVerifyDocument: async function (document, researchEntityId, authorshipData) {
        if (authorshipData.position < 0)
            return {
                error: "User not selected",
                item: authorshipData.document
            };
        const newAuthorship = {
            researchEntity: researchEntityId,
            document: document.id,
            position: authorshipData.position,
            affiliations: authorshipData.affiliationInstituteIds,
            corresponding: authorshipData.corresponding,
            synchronize: authorshipData.synchronize,
            public: authorshipData.public,
        };

        const authorshipFindCriteria = {
            document: newAuthorship.document,
            position: newAuthorship.position
        };

        await Authorship.destroy(authorshipFindCriteria);
        const authorship = await Authorship.create(newAuthorship);
        _.assign(authorship, newAuthorship);
        await authorship.savePromise();

        await Alias.addAlias(researchEntityId, document.authorsStr, authorshipData.position);

        return document;
    },
    beforeCreate: function (user, cb) {
        Promise.resolve(user)
            .then(User.copyAuthData)
            .then(User.setNewUserRole)
            .then(User.setSlug)
            .then(function () {
                cb();
            });
    },
    afterCreate: async function (user, cb) {
        if (!user.id)
            return cb();

        await User.createAliases(user);
        if (User.isInternalUser(user))
            await Group.addUserToDefaultGroup(user);

        cb();
    },
    isInternalUser: function (user) {
        return _.endsWith(user.username, '@' + sails.config.scientilla.ldap.domain);
    },
    getAuthorshipModel: function () {
        return Authorship;
    },
    updateProfile: async function (userId, userData) {
        let aliases;
        if (_.isArray(userData.aliases)) {
            aliases = userData.aliases;
            delete userData.aliases;
        }
        const oldResearchEntity = await User.findOne({id: userId});
        const res = await User.update({id: userId}, userData);
        const newResearchEntity = res[0];

        if (aliases && userId)
            Alias.createOrUpdateAll(userId, aliases);

        const command = 'import:external:user:' + newResearchEntity.id;
        if (newResearchEntity.scopusId !== oldResearchEntity.scopusId)
            GruntTaskRunner.run(command + ':' + DocumentOrigins.SCOPUS);
        if (newResearchEntity.username !== oldResearchEntity.username)
            GruntTaskRunner.run(command + ':' + DocumentOrigins.PUBLICATIONS);

        return newResearchEntity;
    }
});
