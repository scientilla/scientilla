/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 * @docs        :: http://waterlock.ninja/documentation
 */

var _ = require('lodash');
var waterlock = require('waterlock');


module.exports = {
    attributes: require('waterlock').models.user.attributes({

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
        references: {
            collection: 'Reference',
            via: 'owner'
        },
        discardedReferences: {
            collection: 'Reference',
            via: 'owner'
        },
        coauthors: {
            collection: 'Reference',
            via: 'collaborators'
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
                if (!string) return "";
                return string.charAt(0).toUpperCase();
            };
            var capitalize = function (string) {
                if (!string) return "";
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
        getUcAliases: function() {
            var aliases = this.getAliases();
            var ucAliases = _.map(aliases, function(a) { return a.toUpperCase();});
            return ucAliases;
        }

    }),
    getAdministeredGroups: function(userId) {
        return User.findOneById(userId)
            .populate('admininstratedGroups')
            .then(function(user) {
                return user.admininstratedGroups;
            });
    },
    getNotifications: function(userId, user) {
        return User
            .getAdministeredGroups(userId)
            .then(function(administeredGroups) {
                var suggestedReferencesFunctions = _.map(administeredGroups, function(g) { return Group.getSuggestedReferences(g.id);});
                suggestedReferencesFunctions.unshift(User.getSuggestedReferences(userId, user));
                return Promise.all(suggestedReferencesFunctions)
                        .then(function(referencesGroups){
                            var userReferences = referencesGroups[0];
                            return userReferences;
                });
            });
    },

    //sTODO: add deep populate for other fields of the references
    getSuggestedReferences: function(userId, user) {
        function filterSuggested(maybeSuggestedReferences, toBeDiscardedReferences) {
            var suggestedReferences = [];
            _.forEach(maybeSuggestedReferences, function(r1) {
                var checkAgainst = _.union(toBeDiscardedReferences, suggestedReferences);
                var discard = _.some(checkAgainst, function(r2) {
                    return r1.getSimilarity(r2) > similarityThreshold;
                });
                if (discard) return;
                suggestedReferences.push(r1);
            });
            return suggestedReferences;
        }
        var similarityThreshold = .98;
        
        return Promise.all([
            User.findOneById(userId)
                .populate('coauthors')
                .then(function(user) {
//                    _.forEach(user.coauthors, function(r){r.owner = user;});
                    return user.coauthors;
                }),
            Reference.find({authors: {contains: user.surname}}),
            Reference.find({owner: userId})
        ])
        .then(function (results) {
            //sTODO union must discard same references
            var maybeSuggestedReferences = _.union(results[0], results[1]);
            //sTODO: refactor
            //sTODO: add check on discarded references
            var authoredReferences = results[2];
            return filterSuggested(maybeSuggestedReferences, authoredReferences);
        });
    },
    createGroup: function (opts, cb) {
        var userName = opts.userName;
        var group = opts.group;
        async.waterfall([
            function (cb2) {
                User.findOneByName(userName).exec(cb2);
            },
            function (user, cb2) {
                Group.create(group).exec(function (err, group) {
                    cb2(err, user, group);
                });
            },
            function (user, group, cb2) {
                var membershipData = {group: group.id, user: user.id, administrator: true};
                Membership.create(membershipData).exec(function (err, membership) {
                    cb2(err, group);
                });
            }],
                function (err) {
                    cb(err, group);
                });
    },
    joinGroup: function (opts, cb) {
        var user = opts.userName;
        var groupName = opts.groupName;
        async.waterfall([
            function (cb2) {
                User.findOneByName(user).exec(cb2);
            },
            function (user, cb2) {
                Group.findOneByName(groupName).exec(function (err, group) {
                    cb2(err, user, group);
                });
            },
            function (user, group, cb2) {
                var membershipData = {group: group.id, user: user.id, administrator: false};
                Membership.create(membershipData).exec(function (err, membership) {
                    cb2(err, group);
                });
            }],
                function (err, group) {
                    cb(err, group);
                });
    },
    createCompleteUser: function(params) {
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
            .then(function (user){
                user.username = params.username;
                user.password = params.password;
                auth = user;
                return new Promise(function(resolve, reject) {
                    waterlock.engine.attachAuthToUser(auth, user, function() {
                        resolve(user);
                    });
                });
            });
    },

    beforeCreate: require('waterlock').models.user.beforeCreate,
    beforeUpdate: require('waterlock').models.user.beforeUpdate
};
