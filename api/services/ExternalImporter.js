/* global sails, ScopusExternalImporter, PublicationsExternalImporter, User, Group */
// ExternalImporter.js - in api/services

"use strict";

module.exports = {
    updateUserExternal: async (id) => {
        const user = await User.findOneById(id);
        await ScopusExternalImporter.updateUser(user);
    },
    updateGroupExternal: async (id) => {
        const group = await Group.findOneById(id);
        await ScopusExternalImporter.updateGroup(group);
    },
    updateAllExternal: async () => {
        await ScopusExternalImporter.updateAll();
    }
};