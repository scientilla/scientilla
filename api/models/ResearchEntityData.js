module.exports = {
    attributes: {
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
        imported_data: 'JSON',
        profile: 'JSON',
    },
    tableName: 'research_entity_data',
    async getProfile(researchEntityId) {
        const researchEntityData = await ResearchEntityData.findOne({
            researchEntity: researchEntityId
        });
        let profile = {};

        if (researchEntityData && researchEntityData.profile) {
            profile = researchEntityData.profile
        }

        return {
            success: true,
            profile: profile
        };
    },
    async saveProfile(researchEntityId, profile) {
        let researchEntityData = await ResearchEntityData.findOne({
            researchEntity: researchEntityId
        });
        const message = 'Profile has been saved!';

        if (researchEntityData) {
            const response = await ResearchEntityData.update(
                { id: researchEntityData.id },
                { profile: profile }
            );
            researchEntityData = response[0];
        } else {
            researchEntityData = await ResearchEntityData.create({
                researchEntity: researchEntityId,
                profile: profile
            });
        }

        sails.log.debug(researchEntityData);

        return {
            success: true,
            profile: researchEntityData.profile,
            message: message
        };
    },
};