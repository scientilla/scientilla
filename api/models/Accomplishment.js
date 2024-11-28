/* global require, Accomplishment, Exporter, ResearchItemAward, ResearchItemEditorship, ResearchItemEventOrganization, ResearchItemTypes, ResearchItemKinds, Institute */
'use strict';
const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'title',
    'authorsStr',
    'year',
    'yearTo',
    'issuer',
    'source',
    'editorshipRole',
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
        source: {
            model: 'source'
        },
        editorshipRole: {
            type: 'STRING',
            columnName: 'editorship_role',
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
        createdAt: 'Number',
        updatedAt: 'Number',
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
        suggestions: {
            collection: 'researchentity',
            via: 'suggestedaccomplishments',
            through: 'accomplishmentsuggestion'
        },
        favorites: {
            collection: 'researchentity',
            via: 'favoriteaccomplishments',
            through: 'accomplishmentfavorite'
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
            'award_achievement': ResearchItemAward,
            'editorship': ResearchItemEditorship,
            'organized_event': ResearchItemEventOrganization,
        };
        const researchItemType = ResearchItemTypes.getType(type);
        return researchItemModels[researchItemType.key];
    },
    async createResearchItem(itemData) {
        const ResearchItemModel = Accomplishment.getResearchItemModel(itemData.type);
        const selectedData = await ResearchItemModel.selectData(itemData);
        return ResearchItemModel.create(selectedData);
    },
    async updateResearchItem(researchItemId, itemData) {
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
        accomplishmentData.kind = ResearchItemKinds.VERIFIED;

        const copies = await Accomplishment.find(accomplishmentData);

        if (copies.length > 1)
            sails.log.debug(`WARNING Accomplishment.getVerifiedCopy found ${copies.length} copies`);

        return copies.length > 0 ? copies[0] : false;
    },
    async getVerifiedExternal() {
        return false;
    },
    async export(accomplishmentIds, format) {
        let accomplishments = await Accomplishment.find({id: accomplishmentIds})
            .populate([
                'source',
                'type'
            ]);

        accomplishments = _.orderBy(accomplishments, ['year', 'title'], ['desc', 'asc']);

        if (format === 'csv') {
            const rows = mapAccomplishments(accomplishments);
            return Exporter.generateCSV(rows);
        } else if (format === 'excel') {
            const rows = mapAccomplishments(accomplishments);
            return await Exporter.generateExcel([rows], ['Accomplishments']);
        }

        throw {
            success: false,
            message: 'Format not supported'
        };
    },
});


function mapAccomplishments(researchItems) {
    return [[
        'Title',
        'Authors',
        'Year',
        'Year to',
        'Issuer',
        'Editorship role',
        'Event type',
        'Place',
        'Description',
        'Type',
    ]].concat(researchItems.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];
        row.push(researchItem.title);
        row.push(researchItem.authorsStr);
        row.push(researchItem.year);
        row.push(researchItem.yearTo);
        row.push(researchItem.issuer);
        row.push(researchItem.editorshipRole);
        row.push(researchItem.eventType);
        row.push(researchItem.place);
        row.push(researchItem.description);
        row.push(researchItem.type.label);

        return row;
    }));
}



