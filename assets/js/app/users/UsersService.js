/* global Scientilla */

(function () {
    angular.module("users").factory("UsersService", UsersService);

    UsersService.$inject = [
        "Restangular",
        "$q",
        "Prototyper",
        'userConstants'
    ];

    function UsersService(Restangular, $q, Prototyper, userConstants) {
        var service = Restangular.service("users");

        service.getNewUser = function () {
            var user = {
                name: "",
                surname: "",
                slug: "",
                username: "",
                role: userConstants.role.USER
            };
            Prototyper.toUserModel(user);
            return user;
        };

        service.put = function (user) {
            //TODO: check this Restangular bug
            return Restangular.copy(user).put();
        };

        service.validateData = function (user) {
            //validate user data
        };

        service.save = function (user) {
            if (user.id)
                return user.save();
            else
                return this.post(user);
        };

        service.doSave = function (user) {
            delete user.documents;
            return this.save(user).then(function (u) {
                return user;
            });
        };

        service.getCollaborations = function (user) {
            if (!user || !user.id) {
                user.collaborations = [];
                return $q(function (resolve) {
                    resolve(user);
                });
            }
            return user.all('collaborations').getList({populate: ['group']})
                .then(function (collaborations) {
                    user.collaborations = collaborations;
                    Prototyper.toCollaborationsCollection(user.collaborations);
                    return user;
                });
        };

        service.getUsers = function (query) {
            var populate = {populate: ['memberships', 'documents']};

            var q = _.merge({}, query, populate);

            return this.getList(q);
        };

        service.getProfile = function (userId) {
            return this
                .one(userId)
                .get();
        };

        return service;
    }

}());