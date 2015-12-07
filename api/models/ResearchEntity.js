/**
 * ResearchEntity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        getAllReferences: function () {
            return _.union(
                    this.publicReferences,
                    this.privateReferences,
                    this.draftReferences);
        },
        getVerifiedReferences: function () {
            return _.union(
                    this.publicReferences,
                    this.privateReferences);
        }
    },
    getSearchFilterFunction: function(filterKey) {
        //sTODO: use map
        var filters = {
            'all': 'getAllReferences',
            'verified': 'getVerifiedReferences'
        };
        if (filterKey in filters)
            return filters[filterKey];
        else
            return filters['all'];
    },
    getReferences: function (researchEntityModel, researchEntityId, populateFields, filterKey) {
        var filterFunction = this.getSearchFilterFunction(filterKey);
        return researchEntityModel.findOneById(researchEntityId)
                .populate('publicReferences')
                .populate('privateReferences')
                .populate('draftReferences')
                .then(function (researchEntity) {
                    var references = researchEntity[filterFunction]();
                    var referencesId = _.map(references, 'id');
                    var query = Reference.findById(referencesId);
                    _.forEach(populateFields, function (f) {
                        query = query.populate(f);
                    });
                    return query;
                });
    },
    //sTODO: only drafts can be deleted
    deleteReference: function(ResearchEntity, researchEntityId, referenceId) {
        return Reference
                .findById(referenceId)
                .then(function(reference) {
                    if (reference.draft)
                        return Reference.destroy({id: referenceId});
                    else
                        return ResearchEntity.removeReference(researchEntityId, referenceId);
                })
    }
};

