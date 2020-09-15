/* global require, ResearchItemTypes, ResearchItemType, Accomplishment, Project, Patent */
"use strict";

const _ = require('lodash');
const researchItemTypesData = require('../dataInit/researchItemType.json').values;
const researchItemTypes = {};

module.exports = {
    AWARD_ACHIEVEMENT: 'award_achievement',
    ORGANIZED_EVENT: 'organized_event',
    EDITORSHIP: 'editorship',
    PROJECT_COMPETITIVE: 'project_competitive',
    PROJECT_INDUSTRIAL: 'project_industrial',
    PATENT: 'patent',
    init: async () => {
        let researchItemTypesArray = await ResearchItemType.find();
        if (!researchItemTypesArray.length < researchItemTypesData.length) {
            await ResearchItemType.create(researchItemTypesData.slice(researchItemTypesArray.length));
            researchItemTypesArray = await ResearchItemType.find();
        }
        researchItemTypesArray.forEach(dt => {
            researchItemTypes[dt.id] = dt;
            researchItemTypes[dt.key] = dt;
        });
    },
    get: () => researchItemTypes,
    getType: (type) => _.isObject(type) ? researchItemTypes[type.id] : researchItemTypes[type],
    getResearchItemChildModel(type) {
        const researchItemModels = {
            [this.AWARD_ACHIEVEMENT]: Accomplishment,
            [this.EDITORSHIP]: Accomplishment,
            [this.ORGANIZED_EVENT]: Accomplishment,
            [this.PROJECT_COMPETITIVE]: Project,
            [this.PROJECT_INDUSTRIAL]: Project,
            [this.PATENT]: Patent,
        };

        const researchItemType = ResearchItemTypes.getType(type);
        return researchItemModels[researchItemType.key];
    }
};