/* global User, Reference, sails, Auth, SqlService */

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
        drafts: {
            collection: 'Reference',
            via: 'draftCreator'
        },
        documents: {
            collection: 'reference',
            via: 'users',
            through: 'authorship'
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
            via: 'discardedCoauthors',
            dominant: true
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
    draftToDocument: function (draft, researchEntityId) {
        draft.draftCreator = null;
        draft.privateCoauthors.add(researchEntityId);
    },
    copyDraft: function (userId, document) {
        var draftData = _.pick(document, Reference.getFields());
        draftData.draft = true;
        draftData.draftCreator = userId;
        return Reference.create(draftData);
    },
    getAdministeredGroups: function (userId) {
        return User.findOneById(userId)
                .populate('admininstratedGroups')
                .then(function (user) {
                    return user.admininstratedGroups;
                });
    },
    //sTODO: add deep populate for other fields of the references
    getSuggestedDocumentsQuery: function (userId, query) {

        return User.findOneById(userId)
                .then(function (user) {

                    var userDiscardedDocuments = {
                        select: '*',
                        from: 'reference_discardedcoauthors__user_discardedreferences',
                        where: {
                            'reference_discardedcoauthors__user_discardedreferences.user_discardedReferences': userId
                        },
                        as: 'userDiscardedDocuments'
                    };

                    var userDocumentIds = {
                        select: 'document',
                        from: 'authorship',
                        where: {
                            'researchEntity': userId
                        }
                    };


                    var userSuggestedDocuments = {
                        select: [
                            'reference.*',
                            'user_discardedReferences as discarded'
                        ],
                        from: userDiscardedDocuments,
                        rightJoin: [
                            {
                                from: 'reference',
                                on: {
                                    'reference': 'id',
                                    'userDiscardedDocuments': 'reference_discardedCoauthors'
                                }
                            }
                        ],
                        where: {
                            'reference.draft': false,
                            'reference.authorsStr': {
                                'ilike': '%' + user.surname + '%'
                            },
                            'reference.id': {
                                'not in': userDocumentIds
                            }
                        },
                        as: 'suggestedDocuments'
                    };

                    var q = {
                        select: '*',
                        from: userSuggestedDocuments
                    };

                    q.where = _.merge({}, q.where, query.where);
                    q.orderBy = Reference.DEFAULT_SORTING;
                    q.skip = query.skip;
                    q.limit = query.limit;


                    return q;
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
