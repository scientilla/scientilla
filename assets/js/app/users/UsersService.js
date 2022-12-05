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
            'alreadyOpenedSuggested',
            'already_changed_profile',
            'config'
        ];

        const userPopulates = ['administratedGroups', 'aliases', 'memberships', 'groupMemberships', 'userData'];

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

            return this.save(userData).then(function (res) {
                return user;
            }, function (res) {
                return res;
            });
        };

        service.getUser = function (userId, populates = userPopulates) {
            if (!populates.includes('administratedGroups')) {
                populates.push('administratedGroups');
            }

            const populate = {populate: populates};
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

        service.delete = async (user) => {
            return await service.one(user.id).remove();
        };

        service.search = async term => {
            return await service.getUsers(service.getSearchQuery(term));
        };
        /* jshint ignore:end */

        service.getSearchQuery = term => {
            const or = [];
            const termArray = term.split(' ').filter(item => item.length);
            for (let i = 1; i <= termArray.length; i++) {
                const firstName = termArray.slice(0, i);
                const lastName = termArray.slice(i, termArray.length);
                const and1 = {};
                const and2 = {};
                const and3 = {};
                const and4 = {};

                if (firstName.length > 0) {
                    and1.name = {contains: firstName.join (' ')};
                    and2.displayName = {contains: firstName.join (' ')};
                    and3.surname = {contains: firstName.join (' ')};
                    and4.displaySurname = {contains: firstName.join (' ')};
                }

                if (lastName.length > 0) {
                    and1.surname = {contains: lastName.join (' ')};
                    and2.displaySurname = {contains: lastName.join (' ')};
                    and3.name = {contains: lastName.join (' ')};
                    and4.displayName = {contains: lastName.join (' ')};
                }

                or.push(and1);
                or.push(and2);
                or.push(and3);
                or.push(and4);
            }

            return {where: {or: or}};
        };

        return service;
    }

}());
