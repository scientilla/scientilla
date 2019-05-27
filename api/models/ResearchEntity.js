/* global require, ResearchEntity, User, Alias */
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
            through: 'accomplishmentverify'
        },
        isGroup() {
            return this.type === 'group';
        }
    },
    async createResearchEntity(Model, re, type) {
        if (!re.id)
            return;

        const entity = await ResearchEntity.create({type: type});
        await Model.update({id: re.id}, {researchEntity: entity.id});
    },
    async getAliases(researchEntity) {
        if (!researchEntity || researchEntity.isGroup())
            return [];

        const user = await ResearchEntity.getUser(researchEntity.id).populate('aliases');
        return user.getAliases();
    },
    async addAlias(researchEntity, authorStr) {
        if (!researchEntity || researchEntity.isGroup())
            return;

        const user = await ResearchEntity.getUser(researchEntity.id);
        await Alias.addAlias(user.id, authorStr, 0);
    },
    getUser(researchEntityId) {
        return User.findOne({researchEntity: researchEntityId});
    }
});
