(function () {
    angular.module("components").factory("ContextService",
            [function () {
                    var service = { researchEntity: null};
                    
                    service.getResearchEntity = function(){
                        return service.researchEntity;
                    };
                    
                    service.setResearchEntity = function(researchEntity){
                        service.researchEntity = researchEntity;
                    };

                    return service;
                }]);
}());