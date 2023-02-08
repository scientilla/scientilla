
/* global ResearchEntityData, User */

"use strict";

const path = require('path');

module.exports = {
    attributes: {
        profile: 'JSON',
        importedData: {
            columnName: 'imported_data',
            type: 'JSON'
        },
        user: {
            model: 'user'
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

            let profile = ResearchEntityData.setupUserProfile(data);

            if (_.has(profile, 'hidden') && profile.hidden) {
                return {
                    id: data.researchEntity,
                    hidden: profile.hidden
                };
            }

            profile = ResearchEntityData.filterProfile(profile, true);
            profile.id = data.researchEntity;
            profile.active = data.active;

            if (!profile.active) {
                const tmpProfile = {};

                if (_.has(profile, 'username')) {
                    tmpProfile.username = profile.username;
                }

                if (_.has(profile, 'name')) {
                    tmpProfile.name = profile.name;
                }

                if (_.has(profile, 'surname')) {
                    tmpProfile.surname = profile.surname;
                }

                if (_.has(profile, 'groups')) {
                    tmpProfile.groups = profile.groups;
                }

                if (_.has(profile, 'id')) {
                    tmpProfile.id = profile.id;
                }

                if (_.has(profile, 'active')) {
                    tmpProfile.active = profile.active;
                }

                if (_.has(profile, 'gender')) {
                    tmpProfile.gender = profile.gender;
                }

                return tmpProfile;
            }

            if (!_.has(profile, 'hidden')) {
                profile.hidden = false;
            }

            delete profile.export;
            delete profile.dateOfBirth;
            delete profile.gender;
            delete profile.nationality;

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

            return profile;
        }
    },
    migrate: 'safe',
    tableName: 'user_data',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    getProfileImage: function(user, profile) {

        if (_.has(profile, 'image.value') && profile.image.value) {
            return '/profile/images/' + user.researchEntity.toString() + '/' + profile.image.value;
        }

        return false;
    }
};
