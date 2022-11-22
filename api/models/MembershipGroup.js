module.exports = {
    attributes: {
        child_group: {
            model: 'Group'
        },
        parent_group: {
            model: 'Group'
        },
        lastsynch: 'datetime',
        active: 'boolean',
        synchronized: 'boolean'
    },
    afterCreate: async (newlyCreatedRecord, proceed) => {
        await SqlService.refreshMaterializedView('person');
        proceed();
    },
    afterUpdate: async (updatedRecord, proceed) => {
        await SqlService.refreshMaterializedView('person');
        proceed();
    },
    afterDestroy: async (destroyedRecord, proceed) => {
        await SqlService.refreshMaterializedView('person');
        proceed();
    }
};
