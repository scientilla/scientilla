/* global ResearchEntityData */

"use strict";

const path = require('path');

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
        toJSON: function(replaceImage = true) {
            const data = this.toObject();

            let profile = ResearchEntityData.setupProfile(data);

            if (_.has(profile, 'hidden.value') && profile.hidden.value) {
                return {
                    id: data.researchEntity,
                    hidden: profile.hidden.value
                };
            }

            profile = ResearchEntityData.filterProfile(profile, true);

            delete profile.hidden;

            if (replaceImage && _.has(profile, 'image')) {
                profile.image = path.join(
                    'api',
                    'v1',
                    'users',
                    'username',
                    profile.username.toString(),
                    'profile-image'
                );
            }

            profile.id = data.researchEntity;

            return profile;
        }
    },
    migrate: 'safe',
    tableName: 'user_data',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    getProfileImage: async function(user, profile) {

        if (_.has(profile, 'image.value') && profile.image.value) {
            return '/profile/images/' + user.researchEntity.toString() + '/' + profile.image.value;
        }

        return false;
    }
};
