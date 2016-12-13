// Importer.js - in api/services

"use strict";

const _ = require('lodash');

const startingYear = sails.config.scientilla.mainInstituteImport.startingYear;

module.exports = {
    mainInstituteDocumentsImport: function () {

        //TODO if env == development then skip
        let institute;

        return Group.findOneByName(sails.config.scientilla.institute.name)
            .then(i => {
                institute = i;
                return Importer.importScopusDocuments(institute)
            })
            .then(unused=>true);
    },
    importScopusDocuments: function (institute) {

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

            return scopusLoop(Group, institute.id, query)
                .then(items => next(year))
                .catch(err => {
                    sails.log.debug(err);
                    return next(year);
                });
        }

        function next(year) {
            if (year >= (new Date()).getFullYear() + 1)
                return;

            return scopusYearLoop(year + 1);
        }


        function scopusLoop(researchEntityModel, researchEntityId, query) {

            return Connector.getDocuments(researchEntityModel, researchEntityId, query, true)
                .then(result => {
                    const documents = result.items;
                    Group.createDrafts(Group, institute.id, documents)
                        .then(docs => Group.verifyDrafts(Group, institute.id, docs.map(d=>d.id)));

                    if (result.count <= (query.limit + query.skip))
                        return;

                    const newQuery = _.cloneDeep(query);
                    newQuery.skip += query.limit;

                    return scopusLoop(researchEntityModel, researchEntityId, newQuery);
                })
        }


    }
};