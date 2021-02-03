"use strict";

const path = require('path');

module.exports = {
    DEFAULT_SORTING: {
        surname: 'asc',
        name: 'asc',
        updated_at: 'desc'
    },
    attributes: {
        // User
        username: {
            type: 'email',
            defaultsTo: "",
            unique: true
        },
        name: {
            type: 'STRING',
            defaultsTo: ""
        },
        surname: {
            type: 'STRING',
            defaultsTo: ""
        },
        slug: {
            type: 'STRING',
        },
        alreadyAccess: {
            columnName: 'already_access',
            type: "BOOLEAN",
            defaultsTo: false
        },
        alreadyOpenedSuggested: {
            columnName: 'already_opened_suggested',
            type: "BOOLEAN",
            defaultsTo: false
        },
        alreadyChangedProfile: {
            columnName: 'already_changed_profile',
            type: "BOOLEAN",
            defaultsTo: false
        },
        role: {
            type: 'STRING'
        },
        orcidId: {
            columnName: 'orcid_id',
            type: 'STRING'
        },
        scopusId: {
            columnName: 'scopus_id',
            type: 'STRING'
        },
        jobTitle: {
            columnName: 'job_title',
            type: 'STRING'
        },
        displayName: {
            columnName: 'display_name',
            type: 'STRING',
            defaultsTo: ""
        },
        displaySurname: {
            columnName: 'display_surname',
            type: 'STRING',
            defaultsTo: ""
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchEntity',
            unique: true
        },
        memberships: {
            collection: 'personmembership',
            via: 'person',
        },
        active: {
            type: 'BOOLEAN',
            defaultsTo: true
        },

        // ResearchEntityData
        roleCategory: {
            columnName: 'role_category',
            type: 'STRING'
        },
        phone: {
            type: 'STRING'
        },
        gender: {
            type: 'STRING'
        },
        nationality: {
            type: 'STRING'
        },
        ageRange: {
            columnName: 'age_range',
            type: 'STRING'
        },
        groups: {
            type: 'STRING'
        },
        socials: {
            type: 'STRING'
        },
        image: {
            type: 'STRING'
        },
        titles: {
            type: 'STRING'
        },
        description: {
            type: 'STRING'
        },
        customRole: {
            columnName: 'custom_role',
            type: 'STRING'
        },
        website: {
            type: 'STRING'
        },
        address: {
            type: 'STRING'
        },
        interests: {
            type: 'STRING'
        },
        experiencesExternal: {
            columnName: 'experiences_external',
            type: 'STRING'
        },
        education: {
            type: 'STRING'
        },
        certificates: {
            type: 'STRING'
        },
        skillCategories: {
            columnName: 'skill_categories',
            type: 'STRING'
        },
        hidden: {
            type: 'BOOLEAN'
        },
        experiencesInternal: {
            columnName: 'experiences_internal',
            type: 'STRING'
        },
        activeMemberships: {
            columnName: 'active_memberships',
            type: 'STRING'
        },
        activeAndFormerMemberships: {
            columnName: 'active_and_former_memberships',
            type: 'STRING'
        },
        activeMembershipsIncludingSubgroups: {
            columnName: 'active_memberships_including_subgroups',
            type: 'STRING'
        },
        activeAndFormerMembershipsIncludingSubgroups: {
            columnName: 'active_and_former_memberships_including_subgroups',
            type: 'STRING'
        },

        toJSON: function () {
            const person = this.toObject();

            if (!_.isEmpty(person.phone)) {
                person.phone = person.phone.replace(/\s/g, '');
            }

            person.groups = JSON.parse(person.groups);

            if (person.image) {
                person.image = path.join('profile', 'images', person.researchEntity.toString(), person.image);
            } else {
                person.image = path.join('images', 'woman.png');

                if (person.gender === 'M') {
                    person.image = path.join('images', 'man.png');
                }
            }

            for (const property in person) {
                if (_.isNil(person[property]) || person[property] === "") {
                    delete person[property]
                }
            }

            return person;
        }
    },
    migrate: 'safe',
    tableName: 'person',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    getUniqueRoleCategories: async function () {
        const queryPath = `api/queries/uniqueRoleCategoriesOfPeople.sql`;
        const sql = SqlService.readQueryFromFs(queryPath);
        const categories = await SqlService.query(sql);
        return categories.map(c => c.role_category).sort();
    },
    getUniqueNationalities: async function () {
        const queryPath = `api/queries/uniqueNationalitiesOfPeople.sql`;
        const sql = SqlService.readQueryFromFs(queryPath);
        const nationalities = await SqlService.query(sql);
        return nationalities.map(n => n.nationality).sort();
    }
};
