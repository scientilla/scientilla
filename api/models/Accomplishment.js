/* global require, Accomplishment, ItemAward, ItemEditor, ItemEventOrganization, ResearchItemTypes, ResearchItemKinds, Institute */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'title',
    'authorsStr',
    'year',
    'yearTo',
    'affiliation',
    'issuer',
    'medium',
    'editorInChief',
    'eventType',
    'place',
    'description',
    'type',
    'kind',
    'draftCreator',
];

module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {
        year: 'desc',
        title: 'asc'
    },
    attributes: {
        title: 'STRING',
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        year: 'STRING',
        yearTo: {
            type: 'STRING',
            columnName: 'year_to'
        },
        issuer: 'STRING',
        medium: {
            model: 'source'
        },
        editorInChief: {
            type: 'BOOLEAN',
            columnName: 'editor_in_chief',
        },
        eventType: {
            type: 'STRING',
            columnName: 'event_type',
        },
        place: 'STRING',
        description: 'STRING',
        type: {
            model: 'researchitemtype'
        },
        kind: 'STRING',
        draftCreator: {
            model: 'researchentity',
            columnName: 'draft_creator'
        },
        verified: {
            collection: 'accomplishmentverify',
            via: 'accomplishment'
        },
        verifiedUsers: {
            collection: 'user',
            through: 'accomplishmentverifieduser'
        },
        verifiedGroups: {
            collection: 'group',
            through: 'accomplishmentverifiedgroup'
        },
        authors: {
            collection: 'accomplishmentauthor',
            via: 'accomplishment'
        },
        affiliations: {
            collection: 'accomplishmentaffiliation',
            via: 'accomplishment',
        },
        institutes: {
            collection: 'institute',
            via: 'accomplishment',
            through: 'accomplishmentaffiliation'
        },
        async isValid() {
            const ResearchItemModel = Accomplishment.getResearchItemModel(this.type);
            const ri = await ResearchItemModel.findOne({researchItem: this.id});
            return ri.isValid();
        }
    },
    migrate: 'safe',
    tableName: 'accomplishment',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    getResearchItemModel(type) {
        const researchItemModels = {
            'award_achievement': ItemAward,
            'editor': ItemEditor,
            'organized_event': ItemEventOrganization,
        };
        const researchItemType = ResearchItemTypes.getType(type);
        return researchItemModels[researchItemType.key];
    },
    async createDraft(itemData) {
        const ResearchItemModel = Accomplishment.getResearchItemModel(itemData.type);
        const selectedData = await ResearchItemModel.selectData(itemData);
        return ResearchItemModel.create(selectedData);
    },
    async updateDraft(researchItemId, itemData) {
        const ResearchItemModel = Accomplishment.getResearchItemModel(itemData.type);
        const current = await ResearchItemModel.findOne({researchItem: researchItemId});
        const selectedData = await ResearchItemModel.selectData(itemData);
        return ResearchItemModel.update({id: current.id}, selectedData);
    },
    async getVerifiedCopy(researchItem) {
        const accomplishment = await Accomplishment.findOne({id: researchItem.id});
        const accomplishmentData = {};
        fields.forEach(f => accomplishmentData[f] = accomplishment[f]);
        delete accomplishmentData.draftCreator;
        accomplishmentData.kind = ResearchItemKinds.VERIFIED

        const copies = await Accomplishment.find(accomplishmentData);

        if (copies.length > 1)
            sails.log.debug(`WARNING Accomplishment.getVerifiedCopy found ${copies.length} copies`);

        return copies.length > 0 ? copies[0] : false;
    },
});


