/**
 * Reference.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


var _ = require('lodash');
var stringSimilarity = require('string-similarity');

//sTODO: evaluated whether convert the constants to numbers
var VERIFIED = 'verified';
var DRAFT = 'draft';
var PUBLIC = 'public';


module.exports = {
    /* CONSTANTS */
    VERIFIED: VERIFIED,
    DRAFT: DRAFT,
    PUBLIC: PUBLIC,
    /* ATTRIBUTES */
    attributes: {
        title: {
            type: 'STRING'
        },
        authors: 'STRING',
        status: {
            type: 'STRING',
            enum: [DRAFT, VERIFIED, PUBLIC],
            defaultsTo: DRAFT,
            required: true
        },
        verified: 'BOOLEAN',
        public: 'BOOLEAN',
        owner: {
            model: 'User'
        },
        groupOwner: {
            model: 'Group'
        },
        collaborators: {
            collection: 'User',
            via: 'coauthors'
        },
        groupCollaborations: {
            collection: 'Group',
            via: 'collaboratedReferences'
        },
        verify: function () {
//            this.verified = true;
            this.status = VERIFIED;
            return this;
        },
        getAuthors: function () {
            if (!this.authors)
                return [];
            var authors = this.authors.replace(/\s+et all\s*/i, '').split(',').map(_.trim);
            return authors;
        },
        getUcAuthors: function () {
            var authors = this.getAuthors();
            var ucAuthors = _.map(authors, function (a) {
                return a.toUpperCase();
            });
            return ucAuthors;
        },
        setPublic: function () {
//            if (!this.verified)
//                return false;
//            this.public = true;
            this.status = PUBLIC;
            return this;
        },
        getSimilarity: function (ref) {
            var similarityFields = ['authors', 'title'];
            var similarity = 1;
            _.forEach(similarityFields, function (f) {
                var fieldSimilarity;
                if (!_.isNull(this[f]) && !_.isNull(ref[f])) {
                    fieldSimilarity = stringSimilarity.compareTwoStrings(this[f], ref[f]);
                } else {
                    fieldSimilarity = .999;
                }
                similarity *= fieldSimilarity;
            }, this);
            return similarity;
        }
    },
    getSuggestedCollaborators: function (referenceId) {
        return Promise.all([
            Reference.findOne(referenceId).populate('collaborators'),
            User.find()
        ])
                .then(function (results) {
                    var reference = results[0];
                    var users = results[1];
                    var authors = reference.getUcAuthors();
                    var possibleAuthors = _.filter(
                            users,
                            function (u) {
                                var aliases = u.getUcAliases();
                                return !_.isEmpty(_.intersection(aliases, authors));
                            }
                    );
                    var collaboratorsId = _.map(reference.collaborators, "id");
                    var suggestedUsers = _.reject(
                            possibleAuthors,
                            function (u) {
                                return u.id === reference.owner
                                        || _.includes(collaboratorsId, u.id);
                            }
                    );

                    //TODO: search by aliases directly in the db
                    //select *  from reference where authors ilike any (select '%' || str || '%' from alias)
                    return suggestedUsers;
                });

    },
    filterSuggested: function (maybeSuggestedReferences, toBeDiscardedReferences, similarityThreshold) {
        var suggestedReferences = [];
        _.forEach(maybeSuggestedReferences, function (r1) {
            var checkAgainst = _.union(toBeDiscardedReferences, suggestedReferences);
            var discard = _.some(checkAgainst, function (r2) {
                return r1.getSimilarity(r2) > similarityThreshold;
            });
            if (discard)
                return;
            suggestedReferences.push(r1);
        });
        return suggestedReferences;
    }
};
