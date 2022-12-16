/**
 * SourceController
 *
 * @description :: Server-side logic for managing Journals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    addMetricSources: async function (req, res) {
        const sourceId = req.params.sourceId;
        const sourceMetricIds = req.body.sourceMetricIds;
        const createdSourceMetricSources = [];

        if (!_.isArray(sourceMetricIds)) {
            return res.halt(Promise.reject('Scientilla is expecting an array of source metric ID\'s!'));
        }

        for (const sourceMetricId of sourceMetricIds) {
            const sourceMetricSource = await SourceMetricSource.findOne({
                source: sourceId,
                sourceMetric: sourceMetricId
            });

            if (sourceMetricSource) {
                continue;
            }

            const newSourceMetricSource = await SourceMetricSource.create({
                source: sourceId,
                sourceMetric: sourceMetricId
            });

            createdSourceMetricSources.push(newSourceMetricSource);
        }

        await SqlService.refreshMaterializedView('latest_source_metric');

        res.halt(Promise.resolve(createdSourceMetricSources));
    },
    removeMetricSources: async function (req, res) {
        const sourceId = req.params.sourceId;
        const sourceMetricIds = req.body.sourceMetricIds;
        const removedSourceMetricSources = [];

        if (!_.isArray(sourceMetricIds)) {
            return res.halt(Promise.reject('Scientilla is expecting an array of source metric ID\'s!'));
        }

        for (const sourceMetricId of sourceMetricIds) {
            const sourceMetricSource = await SourceMetricSource.findOne({
                source: sourceId,
                sourceMetric: sourceMetricId
            });

            if (sourceMetricSource) {
                const removedSourceMetricSource = await SourceMetricSource.destroy({
                    source: sourceId,
                    sourceMetric: sourceMetricId
                });

                removedSourceMetricSources.push(removedSourceMetricSource);
            }
        }

        await SqlService.refreshMaterializedView('latest_source_metric');

        res.halt(Promise.resolve(removedSourceMetricSources));
    }
};

