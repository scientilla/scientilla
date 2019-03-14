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
        getType: function () {
            if (!this.type)
                return undefined;

            if (_.isObject(this.type))
                return this.type;

            return ResearchItemTypes.getType(this.type);
        }
    },
    async createDraft(researchEntityId, itemData) {
        const researchItemType = ResearchItemTypes.getType(itemData.type);
        if (!researchItemType)
            throw 'Invalid item type';

        let subItem;
        const item = await ResearchItem.create({
            type: researchItemType.id,
            kind: ResearchItemKinds.DRAFT,
            draftCreator: researchEntityId
        });

        try {
            subItem = await ResearchItemType.getResearchItemModel(researchItemType.key)
                .create(Object.assign({}, itemData, {researchItem: item.id}));
        } catch (e) {
            await ResearchItem.destroy({id: item.id});
            return;
        }

        await Author.updateAuthors(item.id, subItem.authorsStr);
    },
    async updateDraft(researchEntityId, draftId, itemData) {
        const researchItem = await ResearchItem.findOne({id: draftId});
        if (!researchItem) throw 'Item not found';
        if (researchItem.draftCreator !== researchEntityId) throw 'Item not found';
        if (researchItem.kind !== ResearchItemKinds.DRAFT) throw 'The item is not a draft';

        const researchItemType = ResearchItemTypes.getType(itemData.type);
        if (!researchItemType)
            throw 'Invalid item type';

        const researchItemModel = await ResearchItemType.getResearchItemModel(researchItemType.key);
        const currentSubResearchItemDraft = await researchItemModel.findOne({researchItem: researchItem.id});
        const updatedSubResearchItemDraft = (await researchItemModel.updateDraft(currentSubResearchItemDraft, itemData))[0];
        const authors = await Author.find({researchItem: researchItem.id});
        const authorsData = Author.getMatchingAuthorsData(updatedSubResearchItemDraft.authorsStr, authors);
        await Author.updateAuthors(researchItem.id, updatedSubResearchItemDraft.authorsStr, authorsData);
    },
    async deleteDraft(draftId) {
        const researchItem = await ResearchItem.findOne({id: draftId});

        if (!researchItem) throw 'Item not found';
        if (researchItem.kind !== ResearchItemKinds.DRAFT) throw 'The item is not a draft';

        await ResearchItem.destroy({id: draftId});
    },
    async deleteDrafts(draftIds) {
        const results = [];
        for (let draftId of draftIds) {
            try {
                const res = await ResearchItem.deleteDraft(draftId);
                results.push(res);
            } catch (e) {
                results.push(e);
            }
        }
        return results;
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
