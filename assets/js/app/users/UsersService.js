(function () {
    angular.module("users").factory("UsersService",
            ["Restangular", "$q", function (Restangular, $q) {
                    var service = Restangular.service("users");

                    service.getNewUser = function () {
                        var user = {
                            name: "",
                            surname: "",
                            slug: "",
                            username: "",
                            role: Scientilla.user.USER
                        };
                        _.assign(user, Scientilla.user);
                        return user;
                    };

                    service.put = function (user) {
                        //TODO: check this Restangular bug
                        return Restangular.copy(user).put();
                    };

                    service.validateData = function (user) {
                        //validate user data
                    };
                    
                    service.save = function(user) {
                        if (user.id)
                            return user.save();
                        else
                            return this.post(user);
                    };

                    service.doSave = function (user) {
                        return this.save(user).then(function (u) {
                            return user;
                        });
                    }

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
                                    _.forEach(user.collaborations, function (c) {
                                        _.defaults(c, Scientilla.collaboration);
                                        _.defaults(c.group, Scientilla.group);
                                    });
                                    return user;
                                });
                    }

                    return service;
                }]);
}());