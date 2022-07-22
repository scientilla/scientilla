/**
 * MembershipController
 *
 * @description :: Server-side logic for managing Memberships
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getCollaborators: async function (req, res) {
        const groupId = req.params.groupId;
        const collaborators = await Membership.find({ group: groupId, synchronized: false }).populate('user');
        res.halt(Promise.resolve(collaborators));
    },
    create: async function (req, res) {
        const active = req.body.active;
        const groupId = req.body.group;
        const synchronized = req.body.synchronized;
        const userId = req.body.user;

        let membership = await Membership.findOne({
            group: groupId,
            user: userId
        });
        if (membership) {
            return res.halt(Promise.reject('There is already a membership for this user and group!'));
        }

        membership = await Membership.create({
            group: groupId,
            user: userId,
            active,
            synchronized
        });
        await SqlService.refreshMaterializedView('person');
        if (!_.isEmpty(membership)) {
            res.halt(Promise.resolve(membership));
        } else {
            res.halt(Promise.reject('Something went wrong!'));
        }
    },
    update: async function (req, res) {
        const id = req.body.id;
        const active = req.body.active;
        const synchronized = req.body.synchronized;
        let membership = await Membership.findOne({ id });
        switch (true) {
            case synchronized:
                return res.halt(Promise.reject('You are not supposed to change members!'));
            case membership.active && membership.synchronized && !synchronized:
                return res.halt(Promise.reject('You cannot change an active member into a collaborator!'));
            case !membership.active && membership.synchronized && !active && !synchronized:
                return res.halt(Promise.reject('You cannot change a former member into a former collaborator!'));
            default:
                break;
        }

        membership = await Membership.update({ id }, { active, synchronized });
        await SqlService.refreshMaterializedView('person');
        if (membership) {
            res.halt(Promise.resolve(membership));
        } else {
            res.halt(Promise.reject('Something went wrong!'));
        }
    },
    destroy: async function (req, res) {
        await Membership.destroy({ id: req.params.id });
        const membership = await Membership.findOne({ id: req.params.id }) || false;
        await SqlService.refreshMaterializedView('person');
        if (!membership) {
            res.halt(Promise.resolve('Membership deleted!'));
        } else {
            res.halt(Promise.reject('Something went wrong!'));
        }
    }
};
