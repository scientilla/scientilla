/**
 * Monitor.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Promise = require("bluebird");

module.exports = {

    attributes: {
        verified_documents_by_authorship: 'INT',
        discarded_documents: 'INT',
        verified_documents_by_kind: 'INT',
        verifications_by_users: 'INT',
        verifications_by_groups: 'INT',
        drafts_by_kind: 'INT',
        draft_with_errors: 'INT',
        external_documents_by_kind: 'INT',
        authorship_without_affiliations: 'INT',
        authorshipgroup_without_affiliations: 'INT',
        affiliations: 'INT',
        used_sources: 'INT',
        used_institutes: 'INT',
        memberships: 'INT',
        administrators: 'INT',
        groups: 'INT',
        users: 'INT',
        users_with_verified_documents: 'INT',
        groups_with_verified_documents: 'INT'
    },

    snap: async function() {
        const query = Promise.promisify(Monitor.query);
        const sqlQueryPath = 'api/queries/monitor.sql';
        const sqlQuery = SqlService.readQueryFromFs(sqlQueryPath);
        const monitorData = await query(sqlQuery, []);
        await Monitor.create(monitorData.rows[0]);
    }
};

