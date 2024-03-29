/* global require, ResearchItemTypes, ResearchItemType, Accomplishment, Project, Patent, TrainingModule */
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
    PROJECT_AGREEMENT: 'project_agreement',
    PATENT: 'patent',
    TRAINING_MODULE_PHD_LECTURE: 'training_module_phd_lecture',
    TRAINING_MODULE_SUMMER_WINTER_SCHOOL_LECTURE: 'training_module_summer_winter_school_lecture',
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
            [this.PROJECT_AGREEMENT]: Project,
            [this.PATENT]: Patent,
            [this.TRAINING_MODULE_PHD_LECTURE]: TrainingModule,
            [this.TRAINING_MODULE_SUMMER_WINTER_SCHOOL_LECTURE]: TrainingModule,
        };

        const researchItemType = ResearchItemTypes.getType(type);
        return researchItemModels[researchItemType.key];
    }
};
