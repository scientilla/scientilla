/* global require, Verify,  ResearchItem, ResearchItemKinds, ResearchItemType */
'use strict';


const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'public'},
    {name: 'favorite'},
    {name: 'researchItem'},
    {name: 'researchEntity'},
];

module.exports = _.merge({}, BaseModel, {
    tableName: 'verify',
    attributes: {
        public: 'BOOLEAN',
        favorite: 'BOOLEAN',
        researchItem: {
            columnName: 'research_item',
            model: 'researchitem'
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
    },
    getDefaults: function (researchItemId, researchEntityId) {
        return {
            researchItem: researchItemId,
            researchEntity: researchEntityId,
            public: true,
            favorite: false
        };
    },
    async verify(researchEntityId, researchItemId, verificationData) {
        const researchItem = await ResearchItem.findOne({id: researchItemId}).populate('type');
        if (!researchItem)
            throw 'Item not found';

        const ResearchItemModel = ResearchItemType.getResearchItemModel(researchItem.type.key);
        const subItem = await ResearchItemModel.findOne({researchItem: researchItem.id});
        if (!subItem.isValid())
            throw 'Item not valid';

        if (await Verify.findOne({researchEntity: researchEntityId, researchItem: researchItemId}))
            throw 'Already verified';


        const verifyData = Object.assign({}, Verify.getDefaults(researchItemId, researchEntityId), verificationData);
        await Verify.create(verifyData);
        if (researchItem.kind === ResearchItemKinds.DRAFT)
            await researchItem.toVerified();

    },
    async unverify(researchEntityId, researchItemId) {
        const researchItem = await ResearchItem.findOne({id: researchItemId}).populate('type');
        if (!researchItem) throw 'Cannot unverify: item not found';
        if (researchItem.kind !== ResearchItemKinds.VERIFIED) throw 'Cannot unverify: item not verified';

        const verify = await Verify.findOne({researchItem: researchItem.id, researchEntity: researchEntityId});
        if (!verify) throw 'Cannot unverify: You have not verified this item';

        await Verify.destroy({id: verify.id});

        const verifies = await Verify.find({researchItem: researchItem.id});
        if (verifies.length === 0) {
            sails.log.debug('Deleting item' + researchItem.id);
            await ResearchItem.destroy({id: researchItem.id});
        }
    },
});
