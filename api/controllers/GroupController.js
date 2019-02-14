/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const DocumentEntityController = require('../lib/DocumentEntityController');

module.exports = _.merge({}, DocumentEntityController, {
    addTags: function (req, res) {
        var documentId = req.params.documentId;
        var groupId = req.params.researchEntityId;
        var tags = req.param('tags');
        res.halt(Group.addTags(TagGroup, groupId, documentId, tags));
    },
    getMBOInstitutePerformance: function (req, res) {
        const cdr = req.query.cdr;
        const year = req.query.year;
        res.halt(Group.getMBOInstitutePerformance(cdr, year));
    },
    getMBOInvitedTalks: function (req, res) {
        const cdr = req.query.cdr;
        const year = req.query.year;
        res.halt(Group.getMBOInvitedTalks(cdr, year));
    },

});