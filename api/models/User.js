/* global User, Document, sails, Auth, SqlService */
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
        //sTODO: move this methods to a isomorphic component
        //sTODO: aliases are managed through a specific association.
        getAliases: function () {

            var firstLetter = function (string) {
                if (!string)
                    return "";
                return string.charAt(0).toUpperCase();
            };
            var capitalize = function (string) {
                if (!string)
                    return "";
                return string.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            };
            var aliases = [];
            var first_name = capitalize(this.name);
            var last_name = capitalize(this.surname);
            var initial_first_name = firstLetter(first_name);
            aliases.push(first_name + " " + last_name);
            aliases.push(last_name + " " + first_name);
            aliases.push(last_name + " " + initial_first_name + ".");
            aliases.push(initial_first_name + ". " + last_name + "");
            aliases = _.uniq(aliases);
            return aliases;
        },
        getUcAliases: function () {
            var aliases = this.getAliases();
            var ucAliases = _.map(aliases, function (a) {
                return a.toUpperCase();
            });
            return ucAliases;
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
    setSlug: function (user) {
        var name = user.name ? user.name : "";
        var surname = user.surname ? user.surname : "";
        var fullName = _.trim(name + " " + surname);
        var slug = fullName.toLowerCase().replace(/\s+/gi, '-');

        return User
            .findBySlug(slug)
            .then(function (usersFound) {
                user.slug = usersFound.length ? slug + _.random(1, 999) : slug;

                return user;
            });
    },
    createCompleteUser: function (params) {
        var attributes = _.keys(User._attributes);
        var userObj = _.pick(params, attributes);

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
    registerUser: function(user) {
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
        const sameUsernameUsers =  await User.findByUsername(user.username);
        if (sameUsernameUsers.length > 0)
            throw new Error('Username already used');

        return user;
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
    getAuthorshipsData: function (document, researchEntityId, newPosition, newAffiliationInstituteIds, newCorresponding) {
        //TODO .populate('aliases')
        return User.findOneById(researchEntityId)
            .then(user => {
                if (!user)
                    return {
                        isVerifiable: false,
                        error: 'User not found',
                        item: researchEntityId
                    };

                const position = !_.isNil(newPosition) ? newPosition : document.getAuthorIndex(user);
                const authorship = document.getAuthorshipByPosition(position) || Authorship.getEmpty();
                //TODO: [Accrocchio] remove when deep populate is added to waterline
                assert(!_.isNil(document.affiliations), 'getAuthorshipAffiliations: affiliations missing');

                const affiliations = document.affiliations
                    .filter(a => a.authorship == authorship.id)
                    .map(a => a.institute);
                //[/Accrocchio]

                const affiliationInstituteIds = !_.isEmpty(newAffiliationInstituteIds) ? newAffiliationInstituteIds : affiliations;
                const corresponding = !_.isNil(newCorresponding) ? newCorresponding : authorship.corresponding;
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
                    document
                };
            })
    },
    doVerifyDocument: function (document, researchEntityId, authorshipData) {
        const newAuthorship = {
            researchEntity: researchEntityId,
            document: document.id,
            position: authorshipData.position,
            affiliations: authorshipData.affiliationInstituteIds,
            corresponding: authorshipData.corresponding
        };

        const authorshipFindCriteria = {
            document: newAuthorship.document,
            position: newAuthorship.position
        };

        return Authorship.destroy(authorshipFindCriteria)
            .then(oldAuthorship=> Affiliation.destroy({authorship: oldAuthorship.id}))
            .then(()=> Authorship.create(newAuthorship))
            .then((authorship)=> {

                _.assign(authorship, newAuthorship);
                return authorship.savePromise();

            }).then(()=>document);
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
    afterCreate: function (user, cb) {
        Promise.resolve(user)
            .then(user => {
                if (User.isInternalUser(user))
                    return Group.addUserToDefaultGroup(user);
                else
                    return user;
            })
            .then(() => cb());
    },
    discardDocument: function (researchEntityId, documentId) {
        return ResearchEntity
            .doUnverifyDocument(User, researchEntityId, documentId)
            .then(() => Discarded.findOrCreate({researchEntity: researchEntityId, document: documentId}))
    },
    isInternalUser: function(user) {
        return _.endsWith(user.username, '@' + sails.config.scientilla.ldap.domain);
    }
});
