/* global sails */
'use strict';

/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const util = require('util');
const Promise = require("bluebird");
const _ = require('lodash');

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

    async function getCount(Model, parentPk, relation, searchCriteria) {
        //can be optimized with binary search
        const sortCriteria = {id: 'asc'};
        const populate = {
            where: searchCriteria,
            sort: sortCriteria
        };
        let step = 1200;
        let skip = 0;
        let limit = 1;
        let res;
        do {
            skip += step;
            populate.skip = skip;
            populate.limit = limit;
            const el = await Model.findOne(parentPk).populate(relation, populate);
            res = el[relation];
        } while (!_.isEmpty(res));
        skip -= step;
        limit = step;
        populate.skip = skip;
        populate.limit = limit;
        const el = await Model.findOne(parentPk).populate(relation, populate);
        res = el[relation];
        return res.length + skip;
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

    let sort = actionUtil.parseSort(req);

    if (_.isEmpty(sort) && relationModel.DEFAULT_SORTING)
        sort = relationModel.DEFAULT_SORTING;
    const hardLimit = 200;
    const skip = actionUtil.parseSkip(req);
    const limit = hardLimit;
    populate.sort = sort;
    populate.limit = limit;
    populate.skip = skip;

    Model.findOne(parentPk)
        .populate(relation, populate)
        .then(async matchingRecord => {
            if (!matchingRecord)
                return res.notFound('No record found with the specified id.');
            if (!matchingRecord[relation])
                return res.notFound(util.format('Specified record (%s) is missing relation `%s`', parentPk, relation));
            let count;
            if ((skip + matchingRecord[relation].length) < hardLimit - 1)
                count = matchingRecord[relation].length;
            else
                count = await getCount(Model, parentPk, relation, populate.where);
            const relationsRecords = matchingRecord[relation];
            const limit = actionUtil.parseLimit(req);
            const recordsId = _.slice(_.map(relationsRecords, 'id'), 0, limit);

            const populateFieldNames = _.castArray(req.param('populate')).filter(_.identity);
            const populateFields = _.filter(relationModel.associations, f => populateFieldNames.some(f2 => f.alias == f2));
            //sTODO add support for deep populate
            const where = {'id': recordsId};
            let query = relationModel.find({where, sort});
            for (let f of populateFields) {
                const fieldAttribute = relationModel._attributes[f.alias];
                const criteria = _.get(fieldAttribute, 'getCriteria') ? await fieldAttribute.getCriteria(req) : {};
                query = query.populate(f.alias, criteria);
            }

            return Promise.all([query, count])
                .spread((matchingRecords, count) => {
                    //if asking for a single related entity
                    if (childPk)
                        if (matchingRecords.length)
                            return res.ok(matchingRecords);
                        else
                            return res.notFound();
                    const postPopulate = _.get(Model, '_attributes.' + relation + '._postPopulate') || ((xs, id) => Promise.resolve(xs));

                    return postPopulate(matchingRecords, parentPk)
                        .then(newRecords => res.ok({
                                count: count,
                                items: newRecords
                            })
                        );
                })
                .catch(err => res.serverError(err));

        })
        .catch(err => res.serverError(err));
};
