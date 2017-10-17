/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var researchEntityController = require('../lib/ResearchEntityController');
const request = require('request-promise');

module.exports = _.merge({}, researchEntityController, {
    addTags: function (req, res) {
        var documentId = req.params.documentId;
        var groupId = req.params.researchEntityId;
        var tags = req.param('tags');
        res.halt(Group.addTags(TagGroup, groupId, documentId, tags));
    },
    getDocumentsBySlug: async (req, res) => {
        const groupSlug = req.params.slug;
        const group = await Group.findOneBySlug(groupSlug);
        if (!group)
            return res.notFound();
        const baseUrl = sails.getBaseUrl();
        const path = `/api/v1/groups/${group.id}/publications`;
        const qs =  req.query;
        qs.populate =  ['source', 'affiliations', 'authorships', 'institutes'];
        const reqOptions = {
            uri: baseUrl+path,
            json: true,
            qs: qs
        };
        const r = await request(reqOptions);
        res.ok(r);
    }

});

