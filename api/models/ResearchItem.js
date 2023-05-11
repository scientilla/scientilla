/* global require, ResearchItem, ResearchItemKinds, ResearchItemTypes, Verify, Author, User, Alias */
'use strict';

const _ = require("lodash");
const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'kind'},
    {name: 'type'}
];

const needsAuthorsTypes = {
    [ResearchItemTypes.AWARD_ACHIEVEMENT]: true,
    [ResearchItemTypes.EDITORSHIP]: true,
    [ResearchItemTypes.ORGANIZED_EVENT]: true,
    [ResearchItemTypes.PROJECT_COMPETITIVE]: true,
    [ResearchItemTypes.PROJECT_INDUSTRIAL]: true,
    [ResearchItemTypes.PROJECT_AGREEMENT]: true,
    [ResearchItemTypes.PATENT]: true,
    [ResearchItemTypes.TRAINING_MODULE]: true
};
const needsAffiliationTypes = {
    [ResearchItemTypes.AWARD_ACHIEVEMENT]: true,
    [ResearchItemTypes.EDITORSHIP]: true,
    [ResearchItemTypes.ORGANIZED_EVENT]: true,
    [ResearchItemTypes.PROJECT_COMPETITIVE]: true,
    [ResearchItemTypes.PROJECT_INDUSTRIAL]: true,
    [ResearchItemTypes.PROJECT_AGREEMENT]: false,
    [ResearchItemTypes.PATENT]: true,
    [ResearchItemTypes.TRAINING_MODULE]: true
};

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
        origin: 'STRING',
        originId: {
            columnName: 'origin_id',
            type: 'STRING'
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
            const ResearchItemChildModel = ResearchItemTypes.getResearchItemChildModel(this.type);
            const childResearchItem = await ResearchItemChildModel.findOne({id: this.id});
            const res = await childResearchItem.isValid();
            if (!res && _.isFunction(childResearchItem.getValidationErrors))
                this.validationErrors = childResearchItem.getValidationErrors();
            return res;
        },
        getValidationErrors() {
            return this.validationErrors;
        },
        needsAuthors() {
            return needsAuthorsTypes[this.getType().key];
        },
        needsAffiliations() {
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
    async createExternal(origin, originId, itemData, newAuthorsData = []) {
        const researchItemData = {
            kind: ResearchItemKinds.EXTERNAL,
            origin,
            originId
        };

        return await this.createResearchItem(researchItemData, itemData, newAuthorsData);
    },
    async createDraft(researchEntityId, itemData, newAuthorsData = []) {
        const researchItemData = {
            kind: ResearchItemKinds.DRAFT,
            draftCreator: researchEntityId,
            origin: itemData.origin || 'scientilla'
        };

        return await this.createResearchItem(researchItemData, itemData, newAuthorsData);
    },
    async createResearchItem(researchItemData, itemData, newAuthorsData = []) {
        const researchItemType = ResearchItemTypes.getType(itemData.type);
        if (!researchItemType)
            throw {success: false, researchItem: itemData, message: 'Invalid item type'};

        researchItemData.type = researchItemType.id;
        const researchItem = await ResearchItem.create(researchItemData);

        const ResearchItemChildModel = ResearchItemTypes.getResearchItemChildModel(researchItemType.key);
        try {
            itemData.researchItem = researchItem.id;
            await ResearchItemChildModel.createResearchItem(itemData);
        } catch (e) {
            await ResearchItem.destroy({id: researchItem.id});
            throw {success: false, researchItem: itemData, message: 'Item not created', msg: e};
        }

        if (researchItem.needsAuthors())
            await Author.updateAuthors(researchItem, itemData.authorsStr, newAuthorsData);

        const newResearchItem = await ResearchItemChildModel.findOne({id: researchItem.id});
        return {success: true, researchItem: newResearchItem, message: 'Item created'};
    },
    async updateDraft(researchEntityId, draftId, itemData) {
        const researchItem = await ResearchItem.findOne({id: draftId});
        if (!researchItem)
            throw {success: false, researchItem: itemData, message: 'Item not found'};
        if (researchItem.draftCreator !== researchEntityId)
            throw {success: false, researchItem: itemData, message: 'Item not found'};
        if (researchItem.kind !== ResearchItemKinds.DRAFT)
            throw {success: false, researchItem: itemData, message: 'The item is not a draft'};
        return this.doUpdate(researchItem, itemData);
    },
    async updateExternal(researchItemId, itemData, newAuthorsData = []) {
        const researchItem = await ResearchItem.findOne({id: researchItemId});
        if (!researchItem)
            throw {success: false, researchItem: itemData, message: 'Item not found'};
        if (researchItem.kind !== ResearchItemKinds.EXTERNAL)
            throw {success: false, researchItem: itemData, message: 'The item is not an external'};
        const res = await this.doUpdate(researchItem, itemData, newAuthorsData);
        await this.synchronizeExternal(res.researchItem, itemData, newAuthorsData);
        return res;
    },
    async synchronizeExternal(external, itemData, newAuthorsData) {
        const verified = await this.getVerifiedExternal(external);
        if (verified)
            await this.doUpdate(verified, itemData, newAuthorsData);
    },
    async doUpdate(researchItem, itemData, newAuthorsData = []) {
        const ResearchItemChildModel = ResearchItemTypes.getResearchItemChildModel(itemData.type);
        if (!ResearchItemChildModel)
            throw {success: false, researchItem: itemData, message: 'Invalid item type'};

        await ResearchItemChildModel.updateResearchItem(researchItem.id, itemData);
        if (researchItem.needsAuthors()) {
            const authorsStr = itemData.authorsStr ?
                itemData.authorsStr :
                (await ResearchItemChildModel.findOne({id: researchItem.id})).authorsStr;
            const currentAuthors = await Author.find({researchItem: researchItem.id}).populate('affiliations');
            const matchedAuthorsData = Author.getMatchingAuthorsData(authorsStr, currentAuthors);
            const authorsData = Author.mergeAffiliations(matchedAuthorsData, newAuthorsData);
            await Author.updateAuthors(researchItem, authorsStr, authorsData);
        }

        const updatedResearchItem = await ResearchItemChildModel.findOne({id: researchItem.id});
        return {success: true, researchItem: updatedResearchItem, message: 'Item updated'};
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
    async copyToDraft(researchItemId, researchEntityId) {
        const itemToCopy = await ResearchItem.findOne({id: researchItemId}).populate(['type', 'authors']);
        if (!itemToCopy)
            throw {success: false, researchItem: researchItemId, message: 'Item not found'};

        let authors = itemToCopy.authors;
        if (itemToCopy.needsAuthors())
            authors = await Author.find({researchItem: researchItemId}).populate('affiliations');

        const ResearchItemChildModel = ResearchItemTypes.getResearchItemChildModel(itemToCopy.type.key);
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

        const ResearchItemChildModel = ResearchItemTypes.getResearchItemChildModel(researchItem.type.key);
        const researchItemChild = await ResearchItemChildModel.findOne({id: researchItemId});
        const authData = await Author.getMatchingAuthorsData(researchItemChild.authorsStr, authorsData);
        await Author.updateAuthors(researchItem, researchItemChild.authorsStr, authData);
    },
    async getVerifiedCopy(researchItem) {
        const ResearchItemChildModel = ResearchItemTypes.getResearchItemChildModel(researchItem.type);
        const copy = await ResearchItemChildModel.getVerifiedCopy(researchItem);
        return copy ? await ResearchItem.findOne({id: copy.id}) : false;
    },
    async getVerifiedExternal(external) {
        const ResearchItemChildModel = ResearchItemTypes.getResearchItemChildModel(external.type);
        const copy = await ResearchItemChildModel.getVerifiedExternal(external);
        return copy ? await ResearchItem.findOne({id: copy.id}) : false;
    },
    async getItem(subItem) {
        return await ResearchItem.findOne({id: subItem.item});
    },
    getFields() {
        return fields.map(f => f.name);
    },
    selectData(draftData) {
        const documentFields = Document.getFields();
        return _.pick(draftData, documentFields);
    },
    async generateAuthorsStr(usersData = []) {
        const users = await User.find({legacyEmail: usersData.map(ud => ud.email.toLocaleLowerCase())});
        const usersMainAlias = await Alias.getUsersMainAlias(users.map(u => u.id));

        return usersData.map(ud => {
            const user = users.find(u => u.legacyEmail === ud.email.toLocaleLowerCase());
            return user ? usersMainAlias.find(a => a.user === user.id).str : User.generateAliasesStr(ud.name, ud.surname)[0];
        }).join(', ');
    }
});
