'user strict'

module.exports = function (req, res, next) {
    waterlock.validator.validateTokenRequest(req, async function (err, user) {
        if (err) {
            return res.forbidden(err);
        }
        const u = await User.findOneById(user.id).populate('administratedGroups');
        const groupId = +req.params.researchEntityId || req.params.id;
        const administratedGroupIds = u.administratedGroups.map(g => g.id);
        console.log(typeof administratedGroupIds[0]);
        console.log(administratedGroupIds);

        console.log(typeof groupId);
        console.log(groupId);
        if (!administratedGroupIds.includes(groupId) && user.role != 'administrator'){
            sails.log.debug('access forbidden ' + req.path);
            return res.forbidden(err);
        }
        // valid request
        next();
    });
};
