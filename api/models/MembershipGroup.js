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
    }
};
