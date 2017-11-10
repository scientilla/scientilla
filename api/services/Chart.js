const Promise = require("bluebird");
const _ = require("lodash");


module.exports = {
    getChartsData: getChartsData
};

function getChartsData(id, researchEntityModelName, charts) {
    if (!_.isArray(charts)) return {
        count: 0,
        items: []
    };

    const query = Promise.promisify(Document.query);
    const chartQueries = charts.map(c => {
        const chartQueryPath = `api/queries/${researchEntityModelName}${c}.sql`;
        const chartQuerySql = SqlService.readQueryFromFs(chartQueryPath);
        return query(chartQuerySql, [id]);
    });
    return Promise.all(chartQueries)
        .then(res => {
            return {
                count: res.length,
                items: _.map(res, 'rows')
            };
        });
}