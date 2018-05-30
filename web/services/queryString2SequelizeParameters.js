const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = function queryString2SequelizeParameters(queryString, Model) {
    const validAssociationNames = Object.keys(Model.associations);
    const populateTmp = queryString.populate || [];
    const populateAll = Array.isArray(populateTmp) ? populateTmp : [populateTmp];
    const populate = populateAll.filter(p => validAssociationNames.includes(p));
    const whereConditions = queryString.where ? JSON.parse(queryString.where) : {};
    const sequelizeParameters = {

        where: getWhereConditions(whereConditions),
        include: populate,
        limit: queryString.limit,
        order: Model.orderBy
    };
    return sequelizeParameters;
};

function getWhereConditions(whereConditions) {
    const fields = Object.keys(whereConditions);
    const whereSequelize = {};
    fields.forEach(f => {
        whereSequelize[f] = {};
        const fieldKeys = Object.keys(whereConditions[f]);
        if (fieldKeys.includes('contains'))
            whereSequelize[f][Op.iLike]= `%${whereConditions[f].contains}%`;
        if (fieldKeys.includes('<='))
            whereSequelize[f][Op.lte] = whereConditions[f]['<='].toString();
        if (fieldKeys.includes('>='))
            whereSequelize[f][Op.gte] = ''+whereConditions[f]['>='].toString();
    });
    return whereSequelize;
}