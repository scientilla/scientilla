/* global sails,DocumentTypes,SourceTypes, ResearchItemTypes */
"use strict";

module.exports = sails => {
    return {
        initialize: next => {
            sails.after('hook:orm:loaded', async () => {
                await DocumentTypes.init();
                await SourceTypes.init();
                await ResearchItemTypes.init();
                next();
            });
        }
    };
};