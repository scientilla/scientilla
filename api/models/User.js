/* global User, Reference, sails, Auth */

/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 * @docs        :: http://waterlock.ninja/documentation
 */

var _ = require('lodash');
var waterlock = require('waterlock');
var Promise = require("bluebird");
var researchEntity = require('./ResearchEntity');

var USER = 'user';
var ADMINISTRATOR = 'administrator';

module.exports = _.merge({}, researchEntity, {
    USER: USER,
    ADMINISTRATOR: ADMINISTRATOR,
    attributes: require('waterlock').models.user.attributes({
        //Constants
        username: {
            type: 'email',
//            required: true,
            defaultsTo: ""
        },
        name: {
            type: 'STRING',
//            required: true,
            defaultsTo: ""
        },
        surname: {
            type: 'STRING',
//            required: true,
            defaultsTo: ""
        },
        slug: {
            type: 'STRING',
            unique: true,
//            required: true,
            alphanumericdashed: true,
            minLength: 3,
            maxLength: 30,
            defaultsTo: ""
        },
        role: {
            type: 'STRING',
            enum: [USER, ADMINISTRATOR],
            defaultsTo: USER,
//            required: true
        },
        orcidId: {
            type: 'STRING'
        },
        scopusId: {
            type: 'STRING'
        },
        drafts: {
            collection: 'Reference',
            via: 'draftCreator'
        },
        privateReferences: {
            collection: 'Reference',
            via: 'privateCoauthors'
        },
        publicReferences: {
            collection: 'Reference',
            via: 'publicCoauthors'
        },
        discardedReferences: {
            collection: 'Reference',
            via: 'discardedCoauthors'
        },
        jsonWebTokens: {
            collection: 'jwt',
            via: 'owner'
        },
        memberships: {
            collection: 'membership',
            via: 'user'
        },
        collaborations: {
            collection: 'collaboration',
            via: 'user'
        },
        aliases: {
            collection: 'alias',
            via: 'user'
        },
        //STODO: typo, correct
        admininstratedGroups: {
            collection: 'group',
            via: 'administrators'
        },
        createReference: function (r) {
            r.owner = this;
            this.references.add(r);
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
                return _.capitalize(string.toLowerCase());
//                return str.replace(/\w\S*/g, function (txt) {
//                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//                });
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
    verifyDraft: function (researchEntityId, draftId) {
        return Reference.findOneById(draftId)
                .then(function (draft) {
                    return Promise.all([draft, Reference.findOne({draft: false, title: draft.title, authors: draft.authors})]);
                })
                .spread(function (draft, sameReference) {
                    if (sameReference) {
                        sameReference.privateCoauthors.add(researchEntityId);
                        sameReference.save();
                        return Reference.destroy({id: draft.id});
                    }
                    var draftCreator = draft.draftCreator;
                    draft.draftCreator = null;
                    draft.draft = false;
                    draft.privateCoauthors.add(draftCreator);
                    return draft.savePromise();
                    //STODO: return the new reference
                });
    },
    getAdministeredGroups: function (userId) {
        return User.findOneById(userId)
                .populate('admininstratedGroups')
                .then(function (user) {
                    return user.admininstratedGroups;
                });
    },
    getNotifications: function (userId) {
        return User
                .getAdministeredGroups(userId)
                .then(function (administeredGroups) {
                    var suggestedDocumentsFunctions = _.map(administeredGroups, function (g) {
                        return Group.getSuggestedDocuments(g.id);
                    });
                    suggestedDocumentsFunctions.unshift(User.getSuggestedDocuments(userId));
                    return Promise.all(suggestedDocumentsFunctions)
                            .then(function (documentsGroups) {
                                var userDocuments = documentsGroups.shift();
                                var notifications = _.map(userDocuments, function (r) {
                                    return {type: 'document', content: {document: r}, targetType: 'user', targetId: userId};
                                });
                                var groupNotifications = _.flatten(documentsGroups.map(function (documents, i) {
                                    var group = administeredGroups[i];
                                    return documents.map(function (r) {
                                        return {type: 'document', content: {document: r}, targetType: 'group', targetId: group.id};
                                    });
                                }));
                                notifications = _.union(notifications, groupNotifications);
                                return notifications;
                            });
                });
    },
    //sTODO: add deep populate for other fields of the references
    getSuggestedDocuments: function (userId, query) {

        return User.findOneById(userId)
                .then(function (user) {
                    var q = _.merge({},
                            query,
                            {where: {draft: false, authors: {contains: user.surname}}},
                            {sort: Reference.DEFAULT_SORTING});
                    return Reference.find(q);
                })
                .then(function (maybeSuggestedDocuments) {
                    return User.filterNecessaryReferences(userId, User, maybeSuggestedDocuments);
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

        return  Promise.resolve(userObj)
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
    setNewUserRole: function (user) {
        return User
                .count()
                .then(function (usersNum) {
                    usersNum === 0 ? user.role = ADMINISTRATOR : user.role = USER;
                    return user;
                });
    },
    checkUsername: function (user) {

        if (_.endsWith(user.username, '@' + sails.config.scientilla.ldap.domain))
            throw new Error('Cannot create domain users');

        return User
                .findByUsername(user.username)
                .then(function (users) {
                    if (users.length > 0)
                        throw new Error('Username already used');

                    return user;
                });
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
    beforeCreate: function (user, cb) {
        Promise.resolve(user)
                .then(User.copyAuthData)
                .then(User.setNewUserRole)
                .then(User.setSlug)
                .then(function () {
                    cb();
                });

    }
});
