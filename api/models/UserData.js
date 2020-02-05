/* global ResearchEntityData */

"use strict";

module.exports = {
    attributes: {
        profile: 'JSON',
        imported_data: 'JSON',
        user: {
            model: 'user'
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchEntity'
        },
        toJSON: function() {
            const data = this.toObject();

            let profile = ResearchEntityData.setupProfile(data);

            if (profile.hidden) {
                return { hidden: profile.hidden };
            }

            profile = ResearchEntityData.filterProfile(profile, true);
            profile = ResearchEntityData.handleDisplayNames(profile);

            return profile;
        }
    },
    migrate: 'safe',
    tableName: 'user_data',
    autoUpdatedAt: false,
    autoCreatedAt: false,
};
