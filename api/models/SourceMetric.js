/* global SourceMetric, DocumentOrigins, Source, SourceMetricSource*/
"use strict";
/**
 * SourceMetric.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

const moment = require('moment');
moment.locale('en');

const fields = [
    'source',
    'origin',
    'sourceOriginId',
    'issn',
    'eissn',
    'sourceTitle',
    'year',
    'name',
    'value'
];

module.exports = _.merge({}, BaseModel, {
    attributes: {
        origin: 'string',
        sourceOriginId: 'string',
        issn: 'string',
        eissn: 'string',
        sourceTitle: 'string',
        year: 'integer',
        name: 'string',
        value: 'string',
        sources: {
            collection: 'Source',
            via: 'metrics',
            through: 'sourcemetricsource'
        },
    },
    sourceIdentifiers: [
        'issn',
        'eissn',
        'sourceTitle',
        'sourceOriginId'
    ],
    selectData: data => {
        return _.pick(data, fields);
    },
    createOrUpdate: async (criteria, data) => {
        const selectedData = SourceMetric.selectData(data);

        const record = await SourceMetric.findOne(criteria);
        if (record)
            await SourceMetric.update({id: record.id}, selectedData);
        else
            await SourceMetric.create(selectedData);
    },
    assignMetrics: async function (year) {
        const startedAt = moment();
        sails.log.info('Source metrics assign {' + (year?year:'all')  + '} started - ' + startedAt.format('DD/MM/YYYY HH:mm:ss'));


        const search={};

        if (year) {
            search.year = year;
        }
        const metricsToAssign = await SourceMetric.find(search);

        /*let metricsToAssign;

        if (year) {
            metricsToAssign = await SourceMetric.find({year: year});
        } else {
            metricsToAssign = await SourceMetric.find();
        }*/

        const searchKeys = ['issn', 'sourceOriginId'];

        let notSourceFoundCount = 0,
            multipleSourceFound = 0,
            assignedCount = 0;
        for (const metric of metricsToAssign) {
            const sourceIdentifiers = _.pick(metric, searchKeys);

            if (sourceIdentifiers.sourceTitle) {
                sourceIdentifiers.title = sourceIdentifiers.sourceTitle;
                delete sourceIdentifiers.sourceTitle;
            }

            if (metric.origin === DocumentOrigins.SCOPUS)
                sourceIdentifiers.scopusId = sourceIdentifiers.sourceOriginId;

            delete sourceIdentifiers.sourceOriginId;

            const criteria = {
                or: Object.keys(sourceIdentifiers).map(i => {
                    if (!sourceIdentifiers[i])
                        return false;

                    const crit = {};
                    crit[i] = sourceIdentifiers[i];
                    return crit;
                }).filter(c => !!c)
            };

            const sources = await Source.find(criteria);

            if (!sources.length) {
                notSourceFoundCount++;
                continue;
            }

            let assignedSources;

            if (sources.length === 1) {
                assignedCount++;
                assignedSources = sources;
            }
            else {
                multipleSourceFound++;
                assignedSources = sources;
                if (metric.origin === DocumentOrigins.SCOPUS) {
                    const originSources = sources.filter(s => !!s.scopusId);
                    if (originSources.length)
                        assignedSources = originSources;
                }
            }

            for (const s of sources) {
                const sourceMetricSource = {sourceMetric: metric.id, source: s.id};
                await SourceMetricSource.findOrCreate(sourceMetricSource);
            }

        }
        sails.log.info('assigned ' + assignedCount + ' sources');
        sails.log.info(notSourceFoundCount + ' metrics without sources');
        sails.log.info(multipleSourceFound + ' multiple sources found');

        const endedAt = moment();
        sails.log.info('Source metrics assign finished - ' + endedAt.format('DD/MM/YYYY HH:mm:ss'));

        const duration = moment.utc(endedAt.diff(startedAt));
        sails.log.info('------------------------------------');
        sails.log.info('It took ' + duration.format('HH:mm:ss') + ' to assign the metrics.');
    }
});