/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const SubResearchEntityController = require('../lib/SubResearchEntityController');

module.exports = _.merge({}, SubResearchEntityController, {
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
    getCollaborators: async function (req, res) {
        const groupId = req.params.groupId;
        const collaborators = await Membership.find({ group: groupId, synchronized: false }).populate('user');
        res.halt(Promise.resolve(collaborators));
    },
    addCollaborator: async function (req, res) {
        const groupId = req.params.groupId;
        const active = req.body.active;
        const userId = req.body.user;
        let membership = await Membership.findOne({
            group: groupId,
            user: userId
        });

        if (membership) {
            return res.halt(Promise.reject('There is already a membership between this user and group!'));
        }

        membership = await Membership.create({
            group: groupId,
            user: userId,
            active,
            synchronized: false
        });

        await SqlService.refreshMaterializedView('person');

        if (!_.isEmpty(membership)) {
            res.halt(Promise.resolve(membership));
        } else {
            res.halt(Promise.reject('Something went wrong!'));
        }
    },
    updateCollaborator: async function (req, res) {
        const groupId = req.params.groupId;
        const userId = req.params.userId;
        const active = req.body.active;
        let membership = await Membership.findOne({ group: groupId, user: userId, synchronized: false });

        if (!membership) {
            return res.halt(Promise.reject('The membership between this user and group is not been found!'));
        }

        membership = await Membership.update({ id: membership.id }, { active });

        await SqlService.refreshMaterializedView('person');

        if (membership) {
            res.halt(Promise.resolve(membership));
        } else {
            res.halt(Promise.reject('Something went wrong!'));
        }
    },
    removeCollaborator: async function (req, res) {
        const groupId = req.params.groupId;
        const userId = req.params.userId;
        let membership = await Membership.findOne({ group: groupId, user: userId, synchronized: false });

        if (!membership) {
            return res.halt(Promise.reject('The membership between this user and group is not been found!'));
        }

        await Membership.destroy({ id: membership.id });

        membership = await Membership.findOne({ id: membership.id });

        await SqlService.refreshMaterializedView('person');

        if (!membership) {
            res.halt(Promise.resolve('The collaborator is been removed!'));
        } else {
            res.halt(Promise.reject('Something went wrong!'));
        }
    },
    getChildGroups: function (req, res) {
        res.halt(Promise.resolve('getChildGroups'));
    },
    getParentGroups: async function (req, res) {
        const groupId = req.params.groupId;
        const childGroup = await Group.findOne({ id: groupId });
        if (!childGroup) {
            return res.halt(Promise.reject('No group found with the given ID!'));
        }
        const parentGroups = await MembershipGroup.find({ child_group: childGroup.id }).populate('parent_group', 'child_group');

        res.halt(Promise.resolve(parentGroups));
    },
    addChildGroup: async function (req, res) {
        if (!_.has(req, 'params.groupId') || !_.has(req, 'body.childGroupId')) {
            return res.halt(Promise.reject('Missing group ID\`s!'));
        }

        const parentGroupId = parseInt(req.params.groupId);
        const childGroupId = parseInt(req.body.childGroupId);

        if (parentGroupId === childGroupId) {
            return res.halt(Promise.reject('The group cannot be a child group of it\'s own!'));
        }

        let membershipGroup = await MembershipGroup.findOne({ parent_group: parentGroupId, child_group: childGroupId });

        if (membershipGroup) {
            return res.halt(Promise.reject('This group is already a child group!'));
        }

        membershipGroup = await MembershipGroup.create({
            parent_group: parentGroupId,
            child_group: childGroupId,
            synchronized: false,
            active: true
        });

        await SqlService.refreshMaterializedView('person');

        if (membershipGroup) {
            res.halt(Promise.resolve(membershipGroup));
        } else {
            res.halt(Promise.reject('Something went wrong!'));
        }
    },
    removeChildGroup: async function (req, res) {
        const parentGroupId = req.params.groupId;
        const childGroupId = req.params.childGroupId;
        let membershipGroup = await MembershipGroup.findOne({ parent_group: parentGroupId, child_group: childGroupId });

        if (!membershipGroup) {
            return res.halt(Promise.reject('The membership between the two groups is not been found!'));
        }

        if (membershipGroup.synchronized) {
            return res.halt(Promise.reject('You cannot remove a synchronized membership!'));
        }

        await MembershipGroup.destroy({ id: membershipGroup.id });

        membershipGroup = await MembershipGroup.findOne({ id: membershipGroup.id });

        await SqlService.refreshMaterializedView('person');

        if (!membershipGroup) {
            res.halt(Promise.resolve('The membership is been removed!'));
        } else {
            res.halt(Promise.reject('Something went wrong!'));
        }
    }
});
