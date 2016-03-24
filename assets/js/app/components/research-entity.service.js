(function () {
    angular.module("components").factory("researchEntityService",
            [function () {
                    var service = {};

                    service.getDocuments = function (researchEntity, query) {

                        if (!query)
                            query = {};

                        var populate = {populate: ['privateCoauthors']};

                        _.merge(query, populate);

                        return researchEntity.getList('privateReferences', query);
                    };

                    return service;
                }]);
}());