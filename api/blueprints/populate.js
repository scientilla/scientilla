/* global sails */
'use strict';

/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const util = require('util');
const Promise = require("bluebird");

/**
 * Populate (or "expand") an association
 *
 * get /model/:parentid/relation
 * get /model/:parentid/relation/:id
 *
 * @param {Integer|String} parentid  - the unique id of the parent instance
 * @param {Integer|String} id  - the unique id of the particular child instance you'd like to look up within this relation
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 *
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
 */

module.exports = function expand(req, res) {

    function getRelationModel(relation) {
        const association = _.find(req.options.associations, {alias: relation});
        const collection = association.collection;
        const model = req._sails.models[collection];
        return model;
    }

    const Model = actionUtil.parseModel(req);
    const relation = req.options.alias;
    if (!relation || !Model)
        return res.serverError();

    const relationModel = getRelationModel(relation);

    // Allow customizable blacklist for params.
    req.options.criteria = req.options.criteria || {};
    req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'id', 'parentid'];

    const parentPk = req.param('parentid');

    // Determine whether to populate using a criteria, or the
    // specified primary key of the child record, or with no
    // filter at all.
    let childPk = actionUtil.parsePk(req);

    // Coerce the child PK to an integer if necessary
    if (childPk && Model.attributes[Model.primaryKey].type == 'integer')
        childPk = +childPk || 0;

    const where = childPk ? {id: [childPk]} : actionUtil.parseCriteria(req);

    const populate = sails.util.objCompact({where: where});

    delete populate.where.populate;

    Model.findOne(parentPk)
        .populate(relation, populate)
        .then(matchingRecord => {
            if (!matchingRecord)
                return res.notFound('No record found with the specified id.');
            if (!matchingRecord[relation])
                return res.notFound(util.format('Specified record (%s) is missing relation `%s`', parentPk, relation));

            const recordsId = _.map(matchingRecord[relation], 'id');

            let populateFields = req.param('populate');
            if (populateFields && !_.isArray(populateFields))
                populateFields = [populateFields];
            populateFields = _.filter(populateFields, f => _.some(relationModel.associations, {alias: f}));

            let sort = actionUtil.parseSort(req);

            if (_.isEmpty(sort) && relationModel.DEFAULT_SORTING)
                sort = relationModel.DEFAULT_SORTING;

            //sTODO add check for non-exstinting pupulate fields
            //sTODO add support for deep populate
            const limit = actionUtil.parseLimit(req);
            const skip = actionUtil.parseSkip(req);
            const where = {'id': recordsId};
            let query = relationModel.find({where, sort, limit, skip});
            _.forEach(populateFields, f=> query = query.populate(f));

            const countQuery = relationModel.count({where});

            return Promise.all([query, countQuery])
                .spread((matchingRecords, count)=> {
                    //if asking for a single related entity
                    if (childPk)
                        if (matchingRecords.length)
                            return res.ok(matchingRecords);
                        else
                            return res.notFound();
                    return res.ok({
                        count: count,
                        items: matchingRecords
                    });
                })
                .catch(err => res.serverError(err));

        })
        .catch(err => res.serverError(err));
};
