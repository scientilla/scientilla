/* global require, ResearchItem, ResearchItemKinds, ResearchItemType, ResearchItemTypes, Verify, Author */
'use strict';

const _ = require("lodash");
const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'kind'},
    {name: 'type'}
];

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_item',
    attributes: {
        kind: 'STRING',
        authors: {
            collection: 'author',
            via: 'researchItem'
        },
        type: {
            model: 'researchitemtype'
        },
        draftCreator: {
            columnName: 'draft_creator',
            model: 'researchentity'
        },
        toVerified: function () {
            this.kind = ResearchItemKinds.VERIFIED;
            this.draftCreator = null;
            return this.savePromise();

        },
        isDraft: function () {
            return this.kind === ResearchItemKinds.DRAFT
        },
        isValid() {
            const requiredFields = [
                'kind',
                'type'
            ];
            return _.every(requiredFields, v => this[v]);
        },
        async isVerificable() {
            const ResearchItemChildModel = ResearchItemType.getResearchItemChildModel(this.type);
            const childResearchItem = await ResearchItemChildModel.findOne({id: this.id});
            return childResearchItem.isValid();
        },
        needsAuthors() {
            const needsAuthorsTypes = {
                'award_achievement': true,
                'editorship': true,
                'organized_event': true
            };
            return needsAuthorsTypes[this.getType().key];
        },
        needsAffiliations() {
            const needsAffiliationTypes = {
                'award_achievement': true,
                'editorship': true,
                'organized_event': true
            };
            return needsAffiliationTypes[this.getType().key];
        },
        getType: function () {
            if (!this.type)
                return undefined;

            if (_.isObject(this.type))
                return this.type;

            return ResearchItemTypes.getType(this.type);
        }
    },
    async createDraft(researchEntityId, itemData, newAuthorsData = []) {
        const researchItemType = ResearchItemTypes.getType(itemData.type);
        if (!researchItemType)
            throw {success: false, researchItem: itemData, message: 'Invalid item type'};

        const researchItem = await ResearchItem.create({
            type: researchItemType.id,
            kind: ResearchItemKinds.DRAFT,
            draftCreator: researchEntityId
        });

        const ResearchItemChildModel = ResearchItemType.getResearchItemChildModel(researchItemType.key);
        try {
            itemData.researchItem = researchItem.id;
            await ResearchItemChildModel.createDraft(itemData);
        } catch (e) {
            await ResearchItem.destroy({id: researchItem.id});
            throw {success: false, researchItem: itemData, message: 'Item not created'};
        }

        if (researchItem.needsAuthors())
            await Author.updateAuthors(researchItem, itemData.authorsStr, newAuthorsData);

        const newDraft = await ResearchItemChildModel.findOne({id: researchItem.id});
        return {success: true, researchItem: newDraft, message: 'Item draft created'};
    },
    async updateDraft(researchEntityId, draftId, itemData) {
        const researchItem = await ResearchItem.findOne({id: draftId});
        if (!researchItem)
            throw {success: false, researchItem: itemData, message: 'Item not found'};
        if (researchItem.draftCreator !== researchEntityId)
            throw {success: false, researchItem: itemData, message: 'Item not found'};
        if (researchItem.kind !== ResearchItemKinds.DRAFT)
            throw {success: false, researchItem: itemData, message: 'The item is not a draft'};

        const ResearchItemChildModel = ResearchItemType.getResearchItemChildModel(itemData.type);
        if (!ResearchItemChildModel)
            throw {success: false, researchItem: itemData, message: 'Invalid item type'};

        await ResearchItemChildModel.updateDraft(researchItem.id, itemData);
        if (researchItem.needsAuthors()) {
            const authorsStr = itemData.authorsStr ?
                itemData.authorsStr :
                (await ResearchItemChildModel.findOne({id: researchItem.id})).authorsStr;
            const authors = await Author.find({researchItem: researchItem.id});
            const authorsData = Author.getMatchingAuthorsData(authorsStr, authors);
            await Author.updateAuthors(researchItem, authorsStr, authorsData);
        }

        const newDraft = await ResearchItemChildModel.findOne({id: researchItem.id});
        return {success: true, researchItem: newDraft, message: 'Item draft updated'};
    },
    async deleteDraft(draftId) {
        const researchItem = await ResearchItem.findOne({id: draftId});
        if (!researchItem)
            throw {success: false, researchItem: draftId, message: 'Item not found'};
        if (researchItem.kind !== ResearchItemKinds.DRAFT)
            throw {success: false, researchItem: researchItem, message: 'The item is not a draft'};

        await ResearchItem.destroy({id: draftId});
        return {success: true, researchItem: researchItem, message: 'Item draft deleted'};
    },
    async copyResearchItem(researchItemId, researchEntityId) {
        const itemToCopy = await ResearchItem.findOne({id: researchItemId}).populate(['type', 'authors']);
        if (!itemToCopy)
            throw {success: false, researchItem: researchItemId, message: 'Item not found'};

        let authors = itemToCopy.authors;
        if (itemToCopy.needsAuthors())
            authors = await Author.find({researchItem: researchItemId}).populate('affiliations');

        const ResearchItemChildModel = ResearchItemType.getResearchItemChildModel(itemToCopy.type.key);
        const researchItem = await ResearchItemChildModel.findOne({id: researchItemId});
        if (!researchItem)
            throw {success: false, researchItem: researchItem, message: 'Item not found'};

        return await ResearchItem.createDraft(researchEntityId,
            Object.assign({}, itemToCopy, researchItem),
            authors);
    },
    async setResearchItemAuthors(researchItemId, authorsData) {
        if (!researchItemId) throw "setAuthors error!";
        const researchItem = await ResearchItem.findOne({id: researchItemId}).populate(['type', 'authors']);
        if (!researchItem) throw 'Research item not found';

        const ResearchItemChildModel = ResearchItemType.getResearchItemChildModel(researchItem.type.key);
        const researchItemChild = await ResearchItemChildModel.findOne({id: researchItemId});
        const authData = await Author.getMatchingAuthorsData(researchItemChild.authorsStr, authorsData);
        await Author.updateAuthors(researchItem, researchItemChild.authorsStr, authData);
    },
    async getVerifiedCopy(researchItem) {
        const ResearchItemChildModel = ResearchItemType.getResearchItemChildModel(researchItem.type);
        const copy = await ResearchItemChildModel.getVerifiedCopy(researchItem);
        return copy ? await ResearchItem.findOne({id: copy.id}) : false;
    },
    async getItem(subItem) {
        return await ResearchItem.findOne({id: subItem.item});
    },
    getFields: function () {
        return fields.map(f => f.name);
    },
    selectData: function (draftData) {
        const documentFields = Document.getFields();
        return _.pick(draftData, documentFields);
    }
});
