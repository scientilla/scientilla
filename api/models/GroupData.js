
/* global ResearchEntityData, Group, GroupData */

"use strict";

const path = require('path');

module.exports = {
    attributes: {
        profile: 'JSON',
        importedData: {
            columnName: 'imported_data',
            type: 'JSON'
        },
        group: {
            model: 'group'
        },
        active: {
            type: 'BOOLEAN',
            defaultsTo: true
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchEntity',
            unique: true
        },
        toJSON: function(replaceImage = true) {
            const data = this.toObject();

            let profile = ResearchEntityData.setupGroupProfile(data);
            profile = ResearchEntityData.filterProfile(profile, true);
            profile.id = data.researchEntity;

            if (replaceImage && _.has(profile, 'coverImage') && _.has(data, 'group.code')) {
                profile.coverImage = path.join(
                    'api',
                    'v1',
                    'groups',
                    'code',
                    data.group.code,
                    'cover-image'
                );
            }

            return profile;
        }
    },
    getCoverImage: function(group, profile) {

        if (_.has(profile, 'coverImage.value') && profile.coverImage.value) {
            return '/profile/images/' + group.researchEntity.toString() + '/' + profile.coverImage.value;
        }

        return false;
    },
    migrate: 'safe',
    tableName: 'group_data',
    autoUpdatedAt: false,
    autoCreatedAt: false
};
