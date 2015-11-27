(function () {
    angular.module("references").
            factory("ReferenceServiceFactory", ReferenceServiceFactory);

    ReferenceServiceFactory.$inject = ['Restangular'];

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
                var isUser = (reference.getType() === Scientilla.reference.USER_REFERENCE);
                var owner = (isUser) ? reference.owner : reference.groupOwner;
                if (isUser) {
                    owner = reference.owner;
                    delete reference.owner;
                } else {
                    owner = reference.groupOwner;
                    delete reference.groupOwner;
                }
                return reference.save().then(function (r) {
                    if (isUser)
                        reference.owner = owner;
                    else
                        reference.groupOwner = owner;
                    return reference;
                });
            };

            return service;
        };
    }
}());
