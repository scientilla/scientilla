(function () {
    angular.module("users").factory("PeopleService", PeopleService);

    PeopleService.$inject = [
        "Restangular",
    ];

    function PeopleService(Restangular) {
        var service = Restangular.service("people");

        const personPopulates = ['memberships'];

        service.getPeople = function (query) {
            var populate = {populate: personPopulates};
            var q = _.merge({}, query, populate);

            return service.getList(q);
        };

        service.getUniqueRoleCategories = function () {
            return service.one('unique-role-categories').get();
        };

        service.getUniqueNationalities = function () {
            return service.one('unique-nationalities').get();
        };

        return service;
    }

}());
