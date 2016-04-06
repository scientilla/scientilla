(function () {

    angular.module("components").factory("researchEntityService", ResearchEntityServiceFactory);



    ResearchEntityServiceFactory.$inject = ['Restangular'];
    
    function ResearchEntityServiceFactory(Restangular) {
        var service = {};
        
        service.getDocuments = getDocuments;
        service.getDrafts = getDrafts;
        service.getSuggestedDocuments = getSuggestedDocuments;

        function getDocuments (researchEntity, query) {

            var populate = {populate: ['privateCoauthors']};

            var q = _.merge({}, query, populate);

            return researchEntity.getList('privateReferences', q);
        };

        function getDrafts (researchEntity, query) {
            if (!query)
                query = {};

            return researchEntity.getList('drafts', query);
        };

        function getSuggestedDocuments (researchEntity, query) {

            var restType = researchEntity.getType() + 's';
            
            return Restangular
                    .one(restType, researchEntity.id)
                    .getList('suggested-documents',query);
        };

        return service;
    }
}());