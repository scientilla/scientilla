/* global GeneralSettings */
// RoleAssociations.js - in api/services

"use strict";

let roleAssociations = [];

module.exports = {
    init: async () => {
        const setting = await GeneralSettings.getSetting('role-associations');
        if (setting && setting.data) {
            roleAssociations = await setting.data;
        }
    },
    get: () => roleAssociations
};