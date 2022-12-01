'use strict'

module.exports = function (req, res, next) {
    waterlock.validator.validateTokenRequest(req, async function (err, user) {
        if (err) {
            return res.forbidden(err);
        }

        const u = await User.findOneById(user.id).populate('administratedGroups');
        let groupId;
        // For updating and destroying an existing membership take the id from the parameters
        if (_.has(req, 'params.id')) {
            const membership = await Membership.findOneById(req.params.id);

            if (!membership) {
                return res.serverError('Missing membership!');
            }

            groupId = membership.group;

            // Check the synchronized flag
            if (_.has(req, 'body.synchronized') && req.body.synchronized) {
                return res.serverError('You can only edit collaborators!');
            }
        } else {
            // Check the synchronized flag
            if (_.has(req, 'body.synchronized') && req.body.synchronized) {
                return res.serverError('You can only add collaborators!');
            }
        }

        if (_.has(req, 'body.group')) {
            groupId = req.body.group;
        }

        const administratedGroupIds = u.administratedGroups.map(g => g.id);
        if (!administratedGroupIds.includes(groupId) && user.role != 'administrator') {
            return res.serverError('You are not an administrator of this group or system!');
        }

        // valid request
        next();
    });
};
