/**
 * GroupChart.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Promise = require("bluebird");

module.exports = {

    attributes: {},
    getChartsData: function (id, researchEntityModelName) {
        const query = Promise.promisify(Chart.query);
        const charts = ['DocumentsByYear', 'DocumentsByType'];
        const chartQueries = charts.map(c => {
            const chartQueryPath = `api/queries/${researchEntityModelName}${c}.sql`;
            const chartQuerySql = SqlService.readQueryFromFs(chartQueryPath);
            const chartQuery = query(chartQuerySql, [id]);
            return chartQuery;
        });
        return Promise.all(chartQueries)
            .then(res => {
                return {
                    count: res.length,
                    items: _.map(res, 'rows')
                };
            });
    }
};