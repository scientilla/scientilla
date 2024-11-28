/* global require, sails, TrainingModule, ResearchItemTypes, ResearchItemTrainingModulePhdLecture, ResearchItemTrainingModuleSummerWinterSchoolLecture, ResearchItemKinds, Exporter  */
'use strict';

const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'type',
    'kind',
    'authorsStr',
    'referent',
    'otherCourse',
    'institute',
    'phdCourse',
    'title',
    'year',
    'description',
    'wholeModule',
    'generalModuleTitle',
    'hours',
    'lectures',
    'researchDomains',
    'location',
    'delivery',
];

module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {
        year: 'desc',
        title: 'asc',
        id: 'desc'
    },
    migrate: 'safe',
    tableName: 'training_module',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    attributes: {
        type: {
            model: 'researchitemtype'
        },
        kind: 'STRING',
        draftCreator: {
            model: 'researchentity',
            columnName: 'draft_creator'
        },
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        referent: {
            model: 'user'
        },
        otherCourse: {
            type: 'BOOLEAN',
            columnName: 'other_course'
        },
        institute: {
            model: 'phdinstitute'
        },
        phdCourse: {
            model: 'phdcourse',
            columnName: 'phd_course'
        },
        wholeModule: {
            type: 'BOOLEAN',
            columnName: 'whole_module'
        },
        generalModuleTitle: {
            type: 'STRING',
            columnName: 'general_module_title'
        },
        title: 'STRING',
        year: 'STRING',
        description: 'STRING',
        hours: 'INTEGER',
        lectures: 'INTEGER',
        researchDomains: {
            type: 'STRING',
            columnName: 'research_domains'
        },
        location: 'STRING',
        delivery: 'STRING',
        verified: {
            collection: 'trainingmoduleverify',
            via: 'trainingModule'
        },
        verifiedUsers: {
            collection: 'user',
            through: 'trainingmoduleverifieduser'
        },
        verifiedGroups: {
            collection: 'group',
            through: 'trainingmoduleverifiedgroup'
        },
        authors: {
            collection: 'trainingmoduleauthor',
            via: 'trainingModule'
        },
        affiliations: {
            collection: 'trainingmoduleaffiliation',
            via: 'trainingModule',
        },
        institutes: {
            collection: 'institute',
            via: 'trainingModule',
            through: 'trainingmoduleaffiliation'
        },
        suggestions: {
            collection: 'researchentity',
            via: 'suggestedtrainingmodules',
            through: 'trainingmodulesuggestion'
        },
        async isValid() {
            const ResearchItemModel = TrainingModule.getResearchItemModel(this.type);
            const ri = await ResearchItemModel.findOne({researchItem: this.id});
            const res = ri.isValid();
            if (!res) this.validationErrors = ri.getValidationErrors();
            return res;
        },
        getValidationErrors() {
            return this.validationErrors;
        }
    },
    getResearchItemModel(type) {
        const researchItemModels = {
            'training_module_phd_lecture': ResearchItemTrainingModulePhdLecture,
            'training_module_summer_winter_school_lecture': ResearchItemTrainingModuleSummerWinterSchoolLecture,
        };
        const researchItemType = ResearchItemTypes.getType(type);
        return researchItemModels[researchItemType.key];
    },
    async createResearchItem(itemData) {
        const ResearchItemModel = this.getResearchItemModel(itemData.type);
        const selectedData = await ResearchItemModel.selectData(itemData);
        const preparedData = ResearchItemModel.prepare(selectedData);
        return ResearchItemModel.create(preparedData);

    },
    async updateResearchItem(researchItemId, itemData) {
        const ResearchItemModel = this.getResearchItemModel(itemData.type);
        const current = await ResearchItemModel.findOne({researchItem: researchItemId});
        if (!current)
            throw {
                researchItem: researchItemId,
                success: false,
                message: 'Training module update: research item not found'
            };
        const selectedData = await ResearchItemModel.selectData(itemData);
        const preparedData = ResearchItemModel.prepare(selectedData);
        return ResearchItemModel.update({id: current.id}, preparedData);
    },
    async getVerifiedCopy(researchItem) {
        const ri = await TrainingModule.findOne({id: researchItem.id});
        const riData = {};
        fields.forEach(f => riData[f] = ri[f]);
        delete riData.draftCreator;
        riData.researchDomains = JSON.stringify(riData.researchDomains);
        riData.kind = ResearchItemKinds.VERIFIED;

        const copies = await TrainingModule.find(riData);

        if (copies.length > 1)
            sails.log.debug(`WARNING TrainingModule.getVerifiedCopy found ${copies.length} copies`);

        return copies.length > 0 ? copies[0] : false;
    },
    async getVerifiedExternal() {
        return false;
    },
    async export(trainingModulesIds, format) {
        let trainingModules = await TrainingModule
            .find({id: trainingModulesIds}).populate([
                'type',
                'referent',
                'institute',
                'phdCourse'
            ]);

        trainingModules = _.orderBy(trainingModules, ['year', 'title'], ['desc', 'asc']);


        const rows = mapTrainingModules(trainingModules);
        if (format === 'csv') {
            return Exporter.generateCSV(rows);
        } else if (format === 'excel') {
            return await Exporter.generateExcel([rows], ['Training modules']);
        }

        throw {
            success: false,
            message: 'Format not supported'
        };
    },
});


function mapTrainingModules(researchItems) {
    return [[
        'Title',
        'Lecturer(s)',
        'Year',
        'Description/Abstract',
        'Taught in a',
        'The lecture is a',
        'Title of the larger module',
        'IIT contact person',
        'Institution',
        'PhD course',
        'Hours',
        'Number of sessions',
        'Area(s)',
        'Location',
        'Delivery'
    ]].concat(researchItems.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];
        row.push(researchItem.title);
        row.push(researchItem.authorsStr);
        row.push(researchItem.year);
        row.push(researchItem.description);
        row.push(researchItem.type.label);
        row.push(researchItem.wholeModule ? 'free-standing module' : 'part of a larger module');
        if (!researchItem.wholeModule) {
            row.push(researchItem.generalModuleTitle);
        } else {
            row.push('/');
        }

        row.push(getDisplayName(researchItem.referent));
        if (researchItem.type.key === 'training_module_summer_winter_school') {
            row.push('/');
            row.push('/');
        } else {
            if (researchItem.otherCourse) {
                row.push('/');
                row.push('Other');
            } else {
                row.push(researchItem.institute.name);
                row.push(researchItem.phdCourse.name);
            }
        }
        row.push(researchItem.hours);
        row.push(researchItem.lectures);
        const researchDomains = JSON.parse(researchItem.researchDomains);
        row.push(researchDomains.join(','));
        row.push(researchItem.location);
        row.push(researchItem.delivery);

        return row;
    }));
}

function getDisplayName(user) {
    let name,
        surname;

    switch (true) {
        case _.has(user, 'displayName') && !_.isEmpty(user.displayName):
            name = user.displayName;
            break;
        case _.has(user, 'name') && !_.isEmpty(user.name):
            name = user.name;
            break;
        default:
            name = '';
            break;
    }

    switch (true) {
        case _.has(user, 'displaySurname') && !_.isEmpty(user.displaySurname):
            surname = user.displaySurname;
            break;
        case _.has(user, 'surname') && !_.isEmpty(user.surname):
            surname = user.surname;
            break;
        default:
            surname = '';
            break;
    }

    return _.trim(name + ' ' + surname);
}