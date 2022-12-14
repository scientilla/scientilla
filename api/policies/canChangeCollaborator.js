'use strict'

module.exports = function (req, res, next) {
    waterlock.validator.validateTokenRequest(req, async function (err, user) {
        if (err) {
            return res.forbidden(err);
        }

        const u = await User.findOneById(user.id).populate('administratedGroups');
        if (!u) {
            return res.serverError('User not found!');
        }

        if (!_.has(req, 'params.groupId')) {
            return res.serverError('Missing group ID!');
        }
        const groupId = parseInt(req.params.groupId);
        const administratedGroupIds = u.administratedGroups.map(g => g.id);

        if (!administratedGroupIds.includes(groupId) && user.role != 'administrator') {
            return res.serverError('You are not an administrator of this group or system!');
        }

        // valid request
        next();
    });
};
