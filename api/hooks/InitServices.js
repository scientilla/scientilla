/* global sails,DocumentTypes,SourceTypes, ResearchItemTypes, RoleAssociations */
"use strict";

module.exports = sails => {
    return {
        initialize: next => {
            sails.after('hook:orm:loaded', async () => {
                await DocumentTypes.init();
                await SourceTypes.init();
                await ResearchItemTypes.init();
                await RoleAssociations.init();
                next();
            });
        }
    };
};