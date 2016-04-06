/* global Membership, User, Group, Reference */

/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var _ = require('lodash');
var Promise = require("bluebird");
var researchEntity = require('./ResearchEntity');

module.exports = _.merge({}, researchEntity, {
    attributes: {
        name: 'STRING',
        slug: 'STRING',
        description: 'TEXT',
        publicationsAcronym: 'TEXT',
        memberships: {
            collection: 'membership',
            via: 'group'
        },
        collaborations: {
            collection: 'collaboration',
            via: 'group'
        },
        administrators: {
            collection: 'user',
            via: 'admininstratedGroups'
        },
        drafts: {
            collection: 'Reference',
            via: 'draftGroupCreator'
        },
        privateReferences: {
            collection: 'Reference',
            via: 'privateGroups'
        },
        publicReferences: {
            collection: 'Reference',
            via: 'publicGroups'
        },
        discardedReferences: {
            collection: 'Reference',
            via: 'discardedGroups'
        },
        suggestedReferences: {
            collection: 'reference',
            via: 'suggestedGroups'
        },
        getType: function () {
            return 'group';
        },
        scopusId: {
            type: 'STRING'
        }
    },
    verifyDraft: function (groupId, referenceId) {
        return Reference.findOneById(referenceId)
                .then(function (draft) {
                    var draftGroupCreator = draft.draftGroupCreator;
                    draft.draftGroupCreator = null;
                    draft.draft = false;
                    draft.privateGroups.add(draftGroupCreator);
                    return draft.savePromise();
                    //STODO: return the new reference
                });
    },
    //sTODO: add deep populate for other fields of the documents
    getSuggestedDocuments: function (groupId, query) {

        var sql = '\
SELECT	"reference_privateCoauthors"\n\
FROM    (   SELECT	u1."id" id\n\
            FROM        "user" u1\n\
            JOIN	"membership" m\n\
            ON		u1."id" = m."user"\n\
            WHERE	"m"."group" = ' + groupId + '\n\
        ) u\n\
JOIN    "reference_privatecoauthors__user_privatereferences" rpup\n\
ON	u."id" = "rpup"."user_privateReferences"\n\
WHERE	"reference_privateCoauthors" NOT IN (\n\
            SELECT	"reference_privateGroups"\n\
            FROM        "group_privatereferences__reference_privategroups"\n\
            WHERE	"group_privateReferences" = ' + groupId + '\n\
        )';

        return Promise
                .promisify(Reference.query)(sql)
                .then(function (result) {

                    var q = {
                        where: {
                            id: _.map(result.rows, 'reference_privateCoauthors')
                        }
                    };

                    q = _.merge({}, q, query, {sort: Reference.DEFAULT_SORTING});

                    return Reference.find(q);
                });

    }
});

