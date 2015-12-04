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

var USER = 'user';
var ADMINISTRATOR = 'administrator';

module.exports = {
    USER: USER,
    ADMINISTRATOR: ADMINISTRATOR,
    attributes: require('waterlock').models.user.attributes({
        //Constants
        username: {
            type: 'STRING',
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
//            unique: true,
//            required: true,
            alphanumericdashed: true,
//            minLength: 3,
//            maxLength: 30,
            defaultsTo: ""
        },
        role: {
            type: 'STRING',
            enum: [USER, ADMINISTRATOR],
            defaultsTo: USER,
            required: true
        },
        draftReferences: {
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
        }
    }),
    getAdministeredGroups: function (userId) {
        return User.findOneById(userId)
                .populate('admininstratedGroups')
                .then(function (user) {
                    return user.admininstratedGroups;
                });
    },
    getNotifications: function (userId, user) {
        return User
                .getAdministeredGroups(userId)
                .then(function (administeredGroups) {
                    var suggestedReferencesFunctions = _.map(administeredGroups, function (g) {
                        return Group.getSuggestedReferences(g.id);
                    });
                    suggestedReferencesFunctions.unshift(User.getSuggestedReferences(userId, user));
                    return Promise.all(suggestedReferencesFunctions)
                            .then(function (referencesGroups) {
                                var userReferences = referencesGroups.shift();
                                var notifications = _.map(userReferences, function (r) {
                                    return {type: 'reference', content: {reference: r}, targetType: 'user', targetId: userId};
                                });
                                var groupNotifications = _.flatten(referencesGroups.map(function (references, i) {
                                    var group = administeredGroups[i];
                                    return references.map(function (r) {
                                        return {type: 'reference', content: {reference: r}, targetType: 'group', targetId: group.id};
                                    });
                                }));
                                notifications = _.union(notifications, groupNotifications);
                                return notifications;
                            });
                });
    },
    //sTODO: add deep populate for other fields of the references
    getSuggestedReferences: function (userId, user) {
        return Promise.all([
            User.findOneById(userId)
                    .populate('coauthors')
                    .then(function (user) {
                        return Reference.getVerifiedAndPublicReferences(user.coauthors);
                    }),
            Reference.find({authors: {contains: user.surname}}).populate('collaborators').populate('owner').then(Reference.getVerifiedAndPublicReferences)
        ])
                .spread(function (suggestedReferences1, suggestedReferences2) {
                    //sTODO union must discard same references
                    var maybeSuggestedReferencesId = _.map(_.union(suggestedReferences1, suggestedReferences2), 'id');

                    return Promise.all([
                        Reference.findById(maybeSuggestedReferencesId)
                                .populate('collaborators')
                                .populate('owner')
                                .populate('groupOwner'),
                        Reference.find({owner: userId})
                    ])
                })
                .spread(function (maybeSuggestedReferences, authoredReferences) {
                    var similarityThreshold = .98;
                    //sTODO: add check on discarded references
                    return Reference.filterSuggested(maybeSuggestedReferences, authoredReferences, similarityThreshold);
                });
    },
    createCompleteUser: function (params) {
        function generateSlug(user) {
            var name = user.name ? user.name : "";
            var surname = user.surname ? user.surname : "";
            var fullName = _.trim(name + " " + surname)
            var slug = fullName.toLowerCase().replace(/\s+/gi, '-');
            return slug;
        }
        var attributes = _.keys(User._attributes);
        var userObj = _.pick(params, attributes);
        if (!userObj.slug) {
            userObj.slug = generateSlug(userObj) + _.random(1, 999);
        }
        return User.create(userObj)
                .then(function (user) {
                    user.username = params.username;
                    user.password = params.password;
                    auth = user;
                    return new Promise(function (resolve, reject) {
                        waterlock.engine.attachAuthToUser(auth, user, function () {
                            resolve(user);
                        });
                    });
                });
    },
    beforeCreate: require('waterlock').models.user.beforeCreate,
    beforeUpdate: require('waterlock').models.user.beforeUpdate
};