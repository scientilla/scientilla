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

            if (profile.hidden) {
                return { hidden: profile.hidden };
            }

            profile = ResearchEntityData.filterProfile(profile, true);
            profile = ResearchEntityData.handleDisplayNames(profile);

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

            if (
                _.has(profile, 'allPublications') ||
                _.has(profile, 'favoritePublications') ||
                _.has(profile, 'disseminationTalks') ||
                _.has(profile, 'scientificTalks') ||
                _.has(profile, 'oralPresentations')
            ) {
                profile.publicWebsite = {};
            }

            if (_.has(profile, 'allPublications')) {
                profile.publicWebsite.allPublications = profile.allPublications;
                delete profile.allPublications;
            }

            if (_.has(profile, 'favoritePublications')) {
                profile.publicWebsite.favoritePublications = profile.favoritePublications;
                delete profile.favoritePublications;
            }

            if (_.has(profile, 'disseminationTalks')) {
                profile.publicWebsite.disseminationTalks = profile.disseminationTalks;
                delete profile.disseminationTalks;
            }

            if (_.has(profile, 'scientificTalks')) {
                profile.publicWebsite.scientificTalks = profile.scientificTalks;
                delete profile.scientificTalks;
            }

            if (_.has(profile, 'oralPresentations')) {
                profile.publicWebsite.oralPresentations = profile.oralPresentations;
                delete profile.oralPresentations;
            }

            profile.id = data.researchEntity;

            return profile;
        }
    },
    migrate: 'safe',
    tableName: 'user_data',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    getProfileImage: async function(username) {
        const user = await User.findOne({username});
        const data = await UserData.findOne({researchEntity: user.researchEntity});
        const profile = data.toJSON(false);

        if (_.has(profile, 'image')) {
            return '/profile/images/' + user.researchEntity.toString() + '/' + profile.image;
        }

        return false;
    }
};
