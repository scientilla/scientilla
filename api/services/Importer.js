// Importer.js - in api/services

"use strict";

const _ = require('lodash');

const env = sails.config.environment;

const startingYear = sails.config.scientilla.mainInstituteImport.startingYear;

module.exports = {
    mainInstituteDocumentsImport: function () {

        //TODO if env == development then skip
        let institute;

        return Group.findOneByName(sails.config.scientilla.institute.name)
            .then(i => {
                institute = i;
                return Importer.getScopusDocuments(institute)
            })
            .then(documents => Group.createDrafts(Group, institute.id, documents))
            .then(documents => Group.verifyDrafts(Group, institute.id, documents.map(d=>d.id)))
    },
    getScopusDocuments: function (institute) {

        return scopusYearLoop(startingYear);

        function scopusYearLoop(year) {

            const query = {
                limit: 200,
                skip: 0,
                where: {
                    connector: 'Scopus',
                    field: 'scopusId',
                    additionalFields: [
                        {
                            field: 'year',
                            value: year
                        }
                    ]
                }
            };

            sails.log.info('Importing documents from ' + year);

            return Importer.scopusLoop(Group, institute.id, query)
                .then(items => next(items))
                .catch(err => {
                    sails.log.debug(err);
                    return next([]);
                });

            function next(items) {


                const documents = _.isArray(items) ? items : [];

                if (year >= (new Date()).getFullYear() + 1)
                    return documents;

                return scopusYearLoop(year + 1)
                    .then(nextItems => documents.concat(nextItems))
            }
        }


    },
    scopusLoop: function (researchEntityModel, researchEntityId, query) {

        return Connector.getDocuments(researchEntityModel, researchEntityId, query)
            .then(result => {
                if (result.count <= (query.limit + query.skip))
                    return result.items;

                const newQuery = _.cloneDeep(query);
                newQuery.skip += query.limit;

                return this.scopusLoop(researchEntityModel, researchEntityId, newQuery)
                    .then(nextItems => result.items.concat(nextItems));
            })
    }
};