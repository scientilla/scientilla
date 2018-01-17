/* global sails,DocumentTypes,SourceTypes */
"use strict";

module.exports = sails => {
    return {
        initialize: next => {
            sails.after('hook:orm:loaded', async () => {
                await DocumentTypes.init();
                await SourceTypes.init();
                next();
            });
        }
    };
};