/* global sails, User */
/**
 * UserController.js
 *
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

const _ = require('lodash');
const SubResearchEntityController = require('../lib/SubResearchEntityController');

module.exports = require('waterlock').actions.user(_.merge({}, SubResearchEntityController, {
    //sTODO: move this function to the user model
    //sTODO: delete documents or set the owner to null
    //sTODO: refactor
    destroy: function (req, res) {
        var userId = req.params.id;
        User.destroy({ id: userId }).exec(function (err, users) {
            if (err)
                return res.negotiate(err);
            if (users.length !== 1)
                return res.negotiate(new Error("An error happened, " + users.length + " users deleted."));
            Auth.destroy({ user: userId }).exec(function (err, auths) {
                if (err)
                    return res.negotiate(err);
                res.ok(users[0]);
            });
        });
    },
    addTags: function (req, res) {
        var documentId = req.params.documentId;
        var userId = req.params.researchEntityId;
        var tags = req.param('tags');
        res.halt(User.addTags(Tag, userId, documentId, tags));
    },
    getMBOOverallPerformance: function (req, res) {
        const username = req.query.email;
        const year = req.query.year;
        res.halt(User.getMBOOverallPerformance(username, year));
    },
    getMBOInstitutePerformance: function (req, res) {
        const username = req.query.email;
        const year = req.query.year;
        res.halt(User.getMBOInstitutePerformance(username, year));
    },
    getMBOInvitedTalks: function (req, res) {
        const username = req.query.email;
        const year = req.query.year;
        res.halt(User.getMBOInvitedTalks(username, year));
    },
    saveAliases: function (req, res) {
        const userId = req.params.userId;
        const aliases = req.body;
        res.halt(Alias.createOrUpdateAll(userId, aliases));
    },
    getByEmail: async function (req, res) {
        const email = req.params.email;
        const user = await User.findOne({
            or: [{
                legacyEmail: email
            }, {
                username: email
            }]
        });

        if (user) {
            return res.ok(user);
        }

        return res.notFound({
            message: 'User not found!'
        });
    }
}));
