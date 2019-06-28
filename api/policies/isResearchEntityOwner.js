/* global ResearchEntity, User*/
'use strict';

module.exports = function (req, res, next) {
    waterlock.validator.validateTokenRequest(req, async function (err, user) {
        if (err) {
            return res.forbidden(err);
        }
        if (user.role === 'administrator')
            return next();

        const researchEntityId = +req.params.researchEntityId;
        const researchEntity = await ResearchEntity.findOne({id: researchEntityId}).populate(['user', 'group']);


        if (researchEntity && researchEntity.type === 'user')
            if (researchEntity.user[0].id === user.id)
                return next();

        if (researchEntity && researchEntity.type === 'group') {
            const u = User.findOne({id: user.id}).populate('administratedGroups');
            const administratedGroupIds = u.administratedGroups.map(g => g.id);
            if (administratedGroupIds.includes(researchEntity.group[0].id))
                return next();
        }


        sails.log.debug('access forbidden ' + req.path);
        return res.forbidden(err);

    });
};
