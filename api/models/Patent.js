/* global require, Patent, Exporter, ResearchItemTypes, ResearchItemPatent, ResearchItemKinds  */
'use strict';

const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {
        year: 'desc',
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
        title: {
            type: 'STRING',
            columnName: 'title'
        },
        application: {
            type: 'STRING',
            columnName: 'application'
        },
        familyDocket: {
            type: 'STRING',
            columnName: 'family_docket'
        },
        inventors: {
            type: 'JSON',
            columnName: 'inventors'
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
        issueYear: {
            type: 'STRING',
            columnName: 'issue_year'
        },
        year: {
            type: 'STRING',
            columnName: 'year'
        },
        translation: {
            type: 'BOOLEAN',
            columnName: 'translation'
        },
        priority: {
            type: 'BOOLEAN',
            columnName: 'priority'
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
            kind: ResearchItemKinds.VERIFIED
        });

        if (copies.length > 1)
            sails.log.debug(`WARNING Patent.getVerifiedCopy found ${copies.length} copies`);

        return copies.length > 0 ? copies[0] : false;
    },
    async getVerifiedExternal(external) {
        return await Patent.findOne({
            code: external.code,
            kind: ResearchItemKinds.VERIFIED
        });
    },
    async export(patentIds, format) {
        const patents = await Patent.find({id: patentIds});

        const rows = mapPatents(patents);
        if (format === 'csv') {
            return Exporter.generateCSV(rows);
        } else if (format === 'excel') {
            return await Exporter.generateExcel([rows], ['Patents']);
        }

        throw {
            success: false,
            message: 'Format not supported'
        };
    },
});


function mapPatents(researchItems) {
    return [[
        'Title',
        'Docket',
        'Application',
        'Filing date',
        'Priority',
        'Inventors',
        'Assignees',
        'Research lines',
        'Patent',
        'Issue date',
        'Publication number',
        'Publication date',
        'Abandoned expired assigned date',
        'Priority pct expiration date',
        'Espacenet URL',
    ]].concat(researchItems.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];

        row.push(researchItem.patentData.title);
        row.push(researchItem.familyDocket);
        row.push(researchItem.patentData.application);
        row.push(researchItem.patentData.filingDate);
        row.push(researchItem.patentData.priority);
        row.push(researchItem.patentData.inventors.map(i => i.surname + ' ' + i.name).join(', '));
        row.push(researchItem.patentData.assignees.map(a => a.name).join(', '));
        row.push(researchItem.patentData.researchLines.map(rl => rl.name).join(', '));
        row.push(researchItem.patentData.patent);
        row.push(researchItem.patentData.issueDate);
        row.push(researchItem.patentData.publication);
        row.push(researchItem.patentData.publicationDate);
        row.push(researchItem.patentData.abandonedExpiredAssignedDate);
        row.push(researchItem.patentData.priorityPctExpirationDate);
        row.push(researchItem.patentData.espacenetUrl);

        return row;
    }));
}