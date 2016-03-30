(function () {
    angular.module("components").factory("researchEntityService",
            [function () {
                    var service = {};
                    
                    service.verify = function (researchEntity, reference) {
                        return researchEntity.one('drafts', reference.id).customPUT({}, 'verified');
                    };

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