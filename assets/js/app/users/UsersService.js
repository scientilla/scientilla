/* global Scientilla */

(function () {
    angular.module("users").factory("UsersService", UsersService);

    UsersService.$inject = [
        "Restangular",
        "$q",
        "Prototyper",
        'userConstants',
        'EventsService'
    ];

    function UsersService(Restangular, $q, Prototyper, userConstants, EventsService) {
        var service = Restangular.service("users");

        let _profile = false;

        const userFields = [
            'id',
            'auth',
            'username',
            'name',
            'surname',
            'slug',
            'alreadyAccess',
            'role',
            'orcidId',
            'scopusId',
            'jobTitle',
            'attributes',
            'alreadyOpenedSuggested',
            'alreadyChangedProfile'
        ];

        service.getNewUser = function () {
            var user = {
                name: "",
                surname: "",
                slug: "",
                username: "",
                role: userConstants.role.USER,
                active: true,
                synchronized: false
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
                return Restangular.one('users', user.id).customPUT(user);
            else
                return this.post(user);
        };

        service.doSave = function (user) {
            const userData = _.pick(user, userFields);
            if (!user.id) {
                userData.password = user.password;
                userData.active = user.active;
                userData.synchronized = user.synchronized;
            }

            if (_.isArray(user.aliases))
                userData.aliases = user.aliases;

            return this.save(userData).then(function (res) {
                return user;
            }, function (res) {
                return res;
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

        service.getUser = function (userId) {
            const populate = {populate: ['collaborations', 'attributes', 'aliases', 'memberships']};
            return service.one(userId).get(populate);
        };

        service.getUsers = function (query) {
            var populate = {populate: ['memberships', 'attributes', 'aliases']};
            var q = _.merge({}, query, populate);

            return service.getList(q);
        };

        service.getUserSettings = function (userId) {
            return this
                .one(userId)
                .get({populate: ['administratedGroups', 'attributes', 'aliases']})
                .then(function (user) {
                    Prototyper.toUserModel(user);
                    user.administratedGroups = Restangular.restangularizeCollection(null, user.administratedGroups, 'groups');
                    return user;
                });
        };

        /* jshint ignore:start */
        service.saveProfile = async (researchEntityId, profile) => {
            const formData = new FormData();
            formData.append('profile', JSON.stringify(profile));

            if (profile.image && profile.image.file) {
                formData.append('profileImage', profile.image.file);
            }

            let response = await Restangular.one('researchentities', researchEntityId)
                .one('save-profile')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});

            response = response.plain();

            if (_.isEmpty(response.errors)) {
                _profile = false;
                await service.getProfile(researchEntityId);
            }

            return response;
        };

        service.getProfile = async (researchEntityId, edit = false) => {
            if (edit) {
                return Restangular.one('researchentities', researchEntityId).customGET('get-edit-profile');
            }

            if (!_profile) {
                _profile = await Restangular.one('researchentities', researchEntityId).customGET('get-profile');
                EventsService.publish(EventsService.USER_PROFILE_CHANGED, _profile);
            }

            return _profile;
        };

        service.getUserProfile = async (researchEntityId) => {
            return await Restangular.one('researchentities', researchEntityId).customGET('get-profile');
        };

        /* jshint ignore:end */

        return service;
    }

}());
