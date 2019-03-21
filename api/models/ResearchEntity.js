/* global require, ResearchEntity */
'use strict';


const _ = require("lodash");
const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'type'}
];

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_entity',
    attributes: {
        type: 'STRING',
        user: {
            collection: 'user',
            via: 'researchEntity'
        },
        group: {
            collection: 'group',
            via: 'researchEntity'
        },
        researchItemDrafts: {
            collection: 'researchitem',
            via: 'draftCreator'
        },
        accomplishmentDrafts: {
            collection: 'accomplishment',
            via: 'draftCreator'
        },
        accomplishments: {
            collection: 'accomplishment',
            //via: 'researchEntity',
            through: 'accomplishmentverify'
        }
    },
    async createResearchEntity(Model, re, type) {
        if (!re.id)
            return;

        const entity = await ResearchEntity.create({type: type});
        await Model.update({id: re.id}, {researchEntity: entity.id});
    }
});
