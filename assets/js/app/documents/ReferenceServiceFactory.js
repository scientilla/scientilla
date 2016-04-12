(function () {
    angular.module("references").
            factory("ReferenceServiceFactory", ReferenceServiceFactory);

    ReferenceServiceFactory.$inject = [
        'Restangular'
    ];

    function ReferenceServiceFactory(Restangular) {
        return function (userId) {
            var service = Restangular.service("references", Restangular.one('users', userId));

            service.getNewReference = function () {
                return {
                    title: "",
                    authors: "",
                    owner: userId,
                    status: Scientilla.reference.DRAFT
                };
            };

            service.delete = function (reference) {
                return reference.remove()
            };

            service.put = function (reference) {
                return Restangular
                        .copy(reference)
                        .customPUT(reference, '/users/' + userId + '/references/' + reference.id);
            };
            
            service.save = function (reference) {
                return reference.save().then(function (r) {
                    return reference;
                });
            };
            
            service.verify = function(reference) {
                return reference.customPUT({},'verified');
            };

            return service;
        };
    }
}());
