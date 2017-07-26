/* global sails, ScopusExternalImporter, PublicationsExternalImporter, User, Group, DocumentOrigins */
// ExternalImporter.js - in api/services

"use strict";

module.exports = {
    updateUserExternal: async (id, origin) => {
        const user = await User.findOneById(id);
        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateUser(user);
        if (!origin || origin === DocumentOrigins.PUBLICATIONS)
            await PublicationsExternalImporter.updateUser(user);
    },
    updateGroupExternal: async (id, origin) => {
        const group = await Group.findOneById(id);
        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateGroup(group);
        if (!origin || origin === DocumentOrigins.PUBLICATIONS)
            await PublicationsExternalImporter.updateGroup(group);
    },
    updateAllExternal: async (origin) => {
        if (!origin || origin === DocumentOrigins.SCOPUS)
            await ScopusExternalImporter.updateAll();
        if (!origin || origin === DocumentOrigins.PUBLICATIONS)
            await PublicationsExternalImporter.updateAll();
    },
    updateDocument: async (origin, id) => {
        if (origin === DocumentOrigins.SCOPUS)
            return await ScopusExternalImporter.updateDocument(id);
    }
};