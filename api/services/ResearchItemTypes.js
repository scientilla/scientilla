/* global require, ResearchItemType */
"use strict";

const researchItemTypesData = require('../dataInit/researchItemType.json').values;
const researchItemTypes = {};

module.exports = {
    AWARD_ACHIEVEMENT: 'award_achievement',
    ORGANIZED_EVENT: 'organized_event',
    EDITORSHIP: 'editorship',
    init: async () => {
        let researchItemTypesArray = await ResearchItemType.find();
        if (!researchItemTypesArray.length)
            researchItemTypesArray = await ResearchItemType.create(researchItemTypesData);
        researchItemTypesArray.forEach(dt => {
            researchItemTypes[dt.id] = dt;
            researchItemTypes[dt.key] = dt;
        });
    },
    get: () => researchItemTypes,
    getType: (type) => _.isObject(type) ? researchItemTypes[type.id] : researchItemTypes[type]
};