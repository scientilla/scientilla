/* global require, Patent, ResearchItemTypes, ResearchItemPatent, ResearchItemKinds  */
'use strict';

const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'kind',
    'type',
    'draftCreator',
    'code',
    'patentFamilyData',
    'patentData'
];

module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {
        filing_year: 'desc',
        title: 'asc',
        id: 'desc'
    },
    migrate: 'safe',
    tableName: 'patent',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    attributes: {
        kind: 'STRING',
        type: {
            model: 'researchitemtype'
        },
        draftCreator: {
            model: 'researchentity',
            columnName: 'draft_creator'
        },
        code: {
            type: 'STRING'
        },
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        familyDocket: {
            type: 'STRING',
            columnName: 'family_docket'
        },
        patentFamilyData: {
            type: 'JSON',
            columnName: 'patent_family_data'
        },
        patentData: {
            type: 'JSON',
            columnName: 'patent_data'
        },
        filingYear: {
            type: 'STRING',
            columnName: 'filing_year'
        },
        verified: {
            collection: 'patentverify',
            via: 'patent'
        },
        verifiedUsers: {
            collection: 'user',
            through: 'patentverifieduser'
        },
        verifiedGroups: {
            collection: 'group',
            through: 'patentverifiedgroup'
        },
        authors: {
            collection: 'patentauthor',
            via: 'patent'
        },
        affiliations: {
            collection: 'patentaffiliation',
            via: 'patent',
        },
        institutes: {
            collection: 'institute',
            via: 'patent',
            through: 'patentaffiliation'
        },
        suggestions: {
            collection: 'researchentity',
            via: 'suggestedpatents',
            through: 'patentsuggestion'
        },
        favorites: {
            collection: 'researchentity',
            via: 'favoritepatents',
            through: 'patentfavorite'
        },
        async isValid() {
            const ResearchItemModel = Patent.getResearchItemModel(this.type);
            const ri = await ResearchItemModel.findOne({researchItem: this.id});
            return ri.isValid();
        }
    },
    getResearchItemModel(type) {
        const researchItemModels = {
            [ResearchItemTypes.PATENT]: ResearchItemPatent
        };
        const researchItemType = ResearchItemTypes.getType(type);
        return researchItemModels[researchItemType.key];
    },
    async createResearchItem(itemData) {
        const ResearchItemModel = this.getResearchItemModel(itemData.type);
        const selectedData = await ResearchItemModel.selectData(itemData);
        if (!ResearchItemModel.validatePatentData(selectedData))
            throw {
                researchItem: selectedData,
                success: false,
                message: 'Data not valid',
                errors: ResearchItemModel.validationErrors()
            };
        selectedData.patentFamilyData = JSON.stringify(selectedData.patentFamilyData);
        selectedData.patentData = JSON.stringify(selectedData.patentData);
        return ResearchItemModel.create(selectedData);

    },
    async updateResearchItem(researchItemId, itemData) {
        const ResearchItemModel = this.getResearchItemModel(itemData.type);
        const current = await ResearchItemModel.findOne({researchItem: researchItemId});
        if (!current)
            throw {
                researchItem: researchItemId,
                success: false,
                message: 'Project update: research item not found'
            };
        const selectedData = await ResearchItemModel.selectData(itemData);
        if (!ResearchItemModel.validatePatentData(selectedData))
            throw {
                researchItem: selectedData,
                success: false,
                message: 'Data not valid',
                errors: ResearchItemModel.validationErrors()
            };

        selectedData.patentFamilyData = JSON.stringify(selectedData.patentFamilyData);
        selectedData.patentData = JSON.stringify(selectedData.patentData);
        return ResearchItemModel.update({id: current.id}, selectedData);
    },
    async getVerifiedCopy(researchItem) {
        const patent = await Patent.findOne({id: researchItem.id});

        const copies = await Patent.find({
            code: patent.code,
            kind:ResearchItemKinds.VERIFIED
        });

        if (copies.length > 1)
            sails.log.debug(`WARNING Patent.getVerifiedCopy found ${copies.length} copies`);

        return copies.length > 0 ? copies[0] : false;
    },
    async getVerifiedExternal(external) {
        return await Patent.findOne({
            application: external.application,
            kind: ResearchItemKinds.VERIFIED
        });
    },
    async export(patentIds, format) {
        const patents = await Patent.find({id: patentIds})
            .populate([
            ]);

        if (format === 'csv')
            return Exporter.patentsToCsv(patents);

        throw {
            success: false,
            message: 'Format not supported'
        };
    },
});


