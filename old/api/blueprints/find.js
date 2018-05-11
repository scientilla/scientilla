'use strict';

/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const _ = require('lodash');
const Promise = require("bluebird");

/**
 * Find Records
 *
 *  get   /:modelIdentity
 *   *    /:modelIdentity/find
 *
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 * Optional:
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */

module.exports = function findRecords(req, res) {

    // Look up the model
    const Model = actionUtil.parseModel(req);

    // If an `id` param was specified, use the findOne blueprint action
    // to grab the particular instance with its primary key === the value
    // of the `id` param.   (mainly here for compatibility for 0.9, where
    // there was no separate `findOne` action)
    if (actionUtil.parsePk(req))
        return require('./findOne')(req, res);

    const limit = actionUtil.parseLimit(req);
    const skip = actionUtil.parseSkip(req);
    let sort = actionUtil.parseSort(req);
    if (_.isEmpty(sort) && Model.DEFAULT_SORTING)
        sort = Model.DEFAULT_SORTING;

    // Lookup for records that match the specified criteria
    let query = Model.find()
        .where(actionUtil.parseCriteria(req))
        .limit(limit)
        .skip(skip)
        .sort(sort);
    query = actionUtil.populateRequest(query, req);

    const countQuery = Model.count()
        .where(actionUtil.parseCriteria(req));

    Promise.all([query, countQuery])
        .spread((matchingRecords, count)=> {

            // Only `.watch()` for new instances of the model if
            // `autoWatch` is enabled.
            if (req._sails.hooks.pubsub && req.isSocket) {
                Model.subscribe(req, matchingRecords);
                if (req.options.autoWatch) {
                    Model.watch(req);
                }
                // Also subscribe to instances of all associated models
                _.each(matchingRecords, function (record) {
                    actionUtil.subscribeDeep(req, record);
                });
            }

            res.ok({
                count: count,
                items: matchingRecords
            });

        })
        .catch(err => res.serverError(err));
};
