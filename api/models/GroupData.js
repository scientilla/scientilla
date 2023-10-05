
/* global ResearchEntityData, GroupTypes */

"use strict";

const { replace } = require('lodash');
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
        slug: {
            type: 'STRING'
        },
        active: {
            type: 'BOOLEAN',
            defaultsTo: true
        },
        type: {
            type: 'STRING'
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
            if (data.type === GroupTypes.DIRECTORATE) {
                for (const property in profile) {
                    if (
                        property !== 'shortDescription' &&
                        property !== 'services'
                    ) {
                        delete profile[property]
                    }
                }
            } else {
                if (_.has(profile, 'services')) {
                    delete profile.services;
                }
            }
            profile.id = data.researchEntity;
            profile.active = data.active;

            if (!profile.active) {
                return {
                    id: profile.id,
                    active: profile.active
                };
            }

            if (replaceImage && _.has(profile, 'coverImage') && _.has(data, 'slug')) {
                profile.coverImage = path.join(
                    'api',
                    'v1',
                    'groups',
                    'slug',
                    data.slug,
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
