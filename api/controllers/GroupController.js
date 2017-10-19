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
    }

});