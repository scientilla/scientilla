/* global require, Verify, ResearchEntity, ResearchItem, ResearchItemKinds, ResearchItemType, Author, Discarded */
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
    async verify(researchItemId, researchEntityId, verificationData) {
        let researchItem, externalDraftId;

        const researchEntity = await ResearchEntity.findOne({id: researchEntityId});
        if (!researchEntity)
            throw {researchItem: researchItem, success: false, message: 'Research entity not found'};

        researchItem = await ResearchItem.findOne({id: researchItemId});
        if (!researchItem)
            throw {researchItem: researchItemId, success: false, message: 'Item not found'};

        if (!(await researchItem.isVerificable()))
            throw {researchItem: researchItem, success: false, message: 'Item not valid'};

        if (researchItem.kind === ResearchItemKinds.EXTERNAL) {
            const res = await ResearchItem.copyToDraft(researchItemId, researchEntityId);
            externalDraftId = res.researchItem.id;
            researchItem = await ResearchItem.findOne({id: externalDraftId});
        }

        if (researchItem.kind === ResearchItemKinds.DRAFT || researchItem.kind === ResearchItemKinds.EXTERNAL) {
            const copy = await ResearchItem.getVerifiedCopy(researchItem);
            if (copy) {
                await ResearchItem.destroy({id: researchItem.id});
                researchItem = copy;
            }
        }

        try {
            return await this.doVerify(researchItem, researchEntity, verificationData);
        } catch (e) {
            if (externalDraftId)
                await ResearchItem.destroy({id: externalDraftId});
            throw e;
        }
    },
    async doVerify(researchItem, researchEntity, verificationData) {
        const verifyData = Object.assign({}, Verify.getDefaults(researchItem.id, researchEntity.id), verificationData);

        if (researchItem.kind === ResearchItemKinds.VERIFIED
            && await Verify.findOne({researchEntity: researchEntity.id, researchItem: researchItem.id}))
            throw {researchItem: researchItem, success: false, message: 'Already verified'};

        const verify = await Verify.create(verifyData);
        if (!verify)
            throw {researchItem: researchItem, success: false, message: 'Critcal error: verification failed'};

        try {
            await Author.verify(researchEntity, researchItem, verify, verificationData);
        } catch (e) {
            await Verify.destroy({id: verify.id});
            throw e;
        }

        if (researchItem.kind === ResearchItemKinds.DRAFT)
            await researchItem.toVerified();

        await Discarded.destroy({researchEntity: researchEntity.id, researchItem: researchItem.id});
        return {researchItem: researchItem, success: true, message: 'Verification completed'};

    },
    async unverify(researchEntityId, researchItemId) {
        const researchItem = await ResearchItem.findOne({id: researchItemId}).populate('type');
        if (!researchItem)
            throw {success: false, researchItem: researchItem, message: 'Cannot unverify: item not found'};
        if (researchItem.kind !== ResearchItemKinds.VERIFIED)
            throw {success: false, researchItem: researchItem, message: 'Cannot unverify: item not verified'};

        const verify = await Verify.findOne({researchItem: researchItem.id, researchEntity: researchEntityId});
        if (!verify)
            throw {
                success: false,
                researchItem: researchItem,
                message: 'Cannot unverify: You have not verified this item'
            };

        await Verify.destroy({id: verify.id});

        const verifies = await Verify.find({researchItem: researchItem.id});
        if (verifies.length === 0) {
            sails.log.debug('Deleting item ' + researchItem.id);
            await ResearchItem.destroy({id: researchItem.id});
        }

        return {success: true, researchItem: researchItem, message: 'UnVerification completed'};
    },
    setPublic: async function (researchEntityId, researchItemId, publicFlag) {
        const verify = await Verify.findOne({
            researchEntity: researchEntityId,
            researchItem: researchItemId
        });

        if (!verify)
            throw {success: false, researchItem: researchItem, message: 'Verify privacy update error: Item not found'};

        await Verify.update({id: verify.id}, {public: publicFlag});

        return {success: true, message: 'Privacy updated'};
    },
    setFavorite: async function (researchEntityId, researchItemId, favorite) {
        const verify = await Verify.findOne({
            researchEntity: researchEntityId,
            researchItem: researchItemId
        });

        if (!verify)
            throw {success: false, researchItem: researchItem, message: 'Verify favorite update error: Item not found'};

        await Verify.update({id: verify.id}, {favorite});
        return {success: true, message: 'Favorite updated'};

    }
});
