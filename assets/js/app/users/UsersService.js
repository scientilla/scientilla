/* global Scientilla */

(function () {
    angular.module("users").factory("UsersService", UsersService);

    UsersService.$inject = [
        "Restangular",
        "$q",
        "Prototyper",
        'userConstants',
        'EventsService',
    ];

    function UsersService(Restangular, $q, Prototyper, userConstants, EventsService) {
        var service = Restangular.service("users");

        let _profile = false;
        let _hasNoProfile = false;

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
            'already_changed_profile',
            'config'
        ];

        const userPopulates = ['administratedGroups', 'attributes', 'aliases', 'memberships', 'groupMemberships', 'userData'];

        service.getNewUser = function () {
            var user = {
                name: "",
                surname: "",
                slug: "",
                username: "",
                role: userConstants.role.USER,
                config: {scientific: false},
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

            const userCopy = angular.copy(user);

            Object.keys(userCopy).forEach(function(key) {
                if (userPopulates.includes(key)) {
                    delete userCopy[key];
                }
            });

            if (userCopy.id)
                return Restangular.one('users', userCopy.id).customPUT(userCopy);
            else
                return this.post(userCopy);
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

        service.getUser = function (userId) {
            const populate = {populate: userPopulates};
            return service.one(userId).get(populate).then(function (user) {
                Prototyper.toUserModel(user);
                user.administratedGroups = Restangular.restangularizeCollection(null, user.administratedGroups, 'groups');
                return user;
            });
        };

        service.getUsers = function (query) {
            var populate = {populate: userPopulates};
            var q = _.merge({}, query, populate);

            return service.getList(q);
        };

        service.getSettings = function (userId) {
            return service.getUser(userId);
        };

        /* jshint ignore:start */
        service.saveProfile = async (researchEntityId, profile, profileImage = false) => {
            const formData = new FormData();
            formData.append('profile', JSON.stringify(profile));

            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            let response = await Restangular.one('researchentities', researchEntityId)
                .one('save-profile')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});

            response = response.plain();

            if (_.isEmpty(response.errors)) {
                _profile = false;
                EventsService.publish(EventsService.USER_PROFILE_SAVED);
                await service.getProfile(researchEntityId);
            }

            return response;
        };

        service.getProfile = async (researchEntityId, edit = false, forceReload = false) => {
            if (edit) {
                return Restangular.one('researchentities', researchEntityId).customGET('get-edit-profile');
            }

            if ((!_profile || forceReload) && !_hasNoProfile) {
                const profile = await Restangular.one('researchentities', researchEntityId).customGET('get-profile');
                if (profile !== 'Has no profile!') {
                    _profile = profile;
                    _hasNoProfile = false;
                    EventsService.publish(EventsService.USER_PROFILE_CHANGED, _profile);
                } else {
                    _hasNoProfile = true;
                }
            }

            return _profile;
        };

        service.getUserProfile = async (researchEntityId) => {
            return await Restangular.one('researchentities', researchEntityId).customGET('get-profile');
        };

        service.emptyProfile = () => {
            _profile = false;
            _hasNoProfile = false;
        };

        /* jshint ignore:end */

        return service;
    }

}());
