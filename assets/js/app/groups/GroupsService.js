/* global Scientilla */

(function () {

    angular.module("groups")
        .factory("GroupsService", GroupService);

    GroupService.$inject = [
        'Restangular',
        'Prototyper',
        'Notification',
        'groupTypes',
        'groupTypeLabels',
        'groupTypePluralLabels',
        'EventsService',
        'ResearchEntitiesService'
    ];

    function GroupService(
        Restangular,
        Prototyper,
        Notification,
        groupTypes,
        groupTypeLabels,
        groupTypePluralLabels,
        EventsService,
        ResearchEntitiesService
    ) {
        var service = Restangular.service("groups");

        service.getNewGroup = getNewGroup;
        service.put = put;
        service.validateData = validateData;
        service.getGroupsQuery = getGroupsQuery;
        service.save = save;
        service.doSave = doSave;
        service.getGroups = getGroups;
        service.get = get;
        service.getGroup = getGroup;
        service.addCollaborator = addCollaborator;
        service.updateCollaborator = updateCollaborator;
        service.removeCollaborator = removeCollaborator;
        service.addChildGroup = addChildGroup;
        service.removeChildGroup = removeChildGroup;
        service.getSettings = getSettings;
        service.getConnectedGroups = getConnectedGroups;
        service.getMembershipGroups = getMembershipGroups;
        service.getParentGroups = getParentGroups;
        service.getTypeTitle = getTypeTitle;
        service.createInstituteStructure = createInstituteStructure;
        service.getGroupTypeLabel = getGroupTypeLabel;
        service.getCollaborators = getCollaborators;
        service.removeCollaborator = removeCollaborator;
        service.isGroupAdmin = isGroupAdmin;
        service.saveProfile = saveProfile;

        return service;

        function getNewGroup() {
            return {
                name: "",
                administrators: [],
                members: []
            };
        }

        function put(group) {
            return Restangular.copy(group).put();
        }

        function validateData(group) {
            //validate user data
        }

        function getGroupsQuery(searchText) {
            var qs = {where: {or: [{name: {contains: searchText}}, {description: {contains: searchText}}]}};
            var model = 'groups';
            return {model: model, qs: qs};
        }

        function save(group) {
            if (group.id)
                return group.save();
            else
                return service.post(group);
        }

        function doSave(group) {
            const associationsKeys = [
                'members',
                'memberships',
                'pis',
                'groupData'
            ];
            const associations = {};
            associationsKeys.forEach(key => associations[key] = group[key]);

            const administrators = group.administrators;
            if (group.administrators)
                group.administrators = group.administrators.map(a => a.id);

            associationsKeys.forEach(key => delete group[key]);
            return service.save(group)
                .then(function () {
                    associationsKeys.forEach(key => group[key] = associations[key]);
                    group.administrators = administrators;
                    return group;
                });
        }


        function getGroup(groupId) {
            const populate = {populate: ['members', 'administrators', 'memberships', 'childGroups', 'parentGroups', 'pis', 'groupData']};
            return service.one(groupId).get(populate);
        }

        function get(query) {
            const populate = {populate: ['members', 'administrators', 'memberships', 'childGroups', 'parentGroups', 'pis', 'groupData']};
            const q = _.merge({}, query, populate);
            return service.getList(q).then(res => {
                return res[0];
            });
        }

        function getGroups(query) {
            const populate = {populate: ['administrators', 'childGroups', 'parentGroups', 'pis', 'groupData']};
            const q = _.merge({}, query, populate);

            return service.getList(q);
        }

        function getMembershipGroups() {
            return Restangular.all('membershipgroups').customGET('', {
                where: {
                    active: true
                },
                populate: ['parent_group', 'child_group'],
                limit: 10000
            }).then(res => {
                return res.items;
            });
        }

        function getParentGroups(researchEntityId) {
            return Restangular
                .one(`groups/${researchEntityId}/get-parent-groups`)
                .get();
        }

        function createInstituteStructure(institute, membershipGroups) {

            membershipGroups = _.orderBy(membershipGroups.filter(mg => _.has(mg, 'child_group') && _.has(mg, 'parent_group')), 'parent_group.id', 'desc');

            // Map the index of membershipGroups with child group => index = value, child group id = key
            const indexMapping = membershipGroups.reduce((acc, el, i) => {
                acc[el.child_group.id] = i;
                return acc;
            }, {});

            // Loop over membership groups
            membershipGroups.forEach(el => {
                let parentEl;

                // Handle the main institute
                if (el.parent_group.id === 1) {
                    // Store the parent group as institute if it's empty
                    if (_.isEmpty(institute)) {
                        institute = Prototyper.toGroupModel(el.parent_group);
                    }
                    // Set the parent element to the institute
                    parentEl = institute;
                } else {
                    // Use our mapping to locate the parent element in our data array
                    parentEl = membershipGroups[indexMapping[el.parent_group.id]];
                }

                // Skip if the parent element is empty
                if (!parentEl) {
                    return;
                }

                // Add our current element to its parent's `childGroups` array
                const group = Prototyper.toGroupModel(el.child_group);
                if (group.active) {
                    group.childGroups = el.childGroups || [];
                    if (!_.has(parentEl, 'childGroups')) {
                        parentEl.childGroups = [];
                    }
                    parentEl.childGroups.push(group);
                    parentEl.childGroups = _.orderBy(parentEl.childGroups, 'name');
                }
            });

            membershipGroups.forEach(el => {
                // Group the childgroups by type
                el.child_group.types = _.groupBy(el.child_group.childGroups, 'type');
            });

            // Group the childgroups by type
            institute.types = _.groupBy(institute.childGroups, 'type');

            return institute;
        }

        /* jshint ignore:start */
        function getConnectedGroups(groupIds) {
            return Restangular.all('membershipgroups').customGET('', {
                populate: ['parent_group', 'child_group']
            }).then(async (res) => {
                const allMembershipGroups = res.items;

                let institute = false;

                if (groupIds.length === 1 && groupIds[0] === 1) {
                    institute = await service.getGroup(1);
                } else {
                    for (const id of groupIds) {
                        const group = allMembershipGroups.find(membershipGroup => membershipGroup.child_group.id === id);

                        if (group && group.parent_group) {
                            if (!groupIds.includes(group.parent_group.id)) {
                                groupIds.push(group.parent_group.id);
                            }
                        }
                    }
                }

                const membershipGroups = _.orderBy(
                    allMembershipGroups.filter(membershipGroup => groupIds.includes(membershipGroup.child_group.id)),
                    'parent_group.id',
                    'desc'
                );

                return service.createInstituteStructure(institute, membershipGroups);
            });
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function addChildGroup(parentGroup, childGroup) {
            try {
                await Restangular
                    .one(`groups/${parentGroup.id}/add-child-group`)
                    .customPUT({
                        childGroupId: childGroup.id
                    })
                    .then(() => {
                        Notification.success('Child group is been added!');
                    }, error => {
                        throw error.data;
                    });
            } catch (error) {
                Notification.warning(error);
            }
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function removeChildGroup(parentGroup, childGroup) {
            try {
                await Restangular
                    .one(`groups/${parentGroup.id}`)
                    .one(`remove-child-group/${childGroup.id}`)
                    .remove()
                    .then(() => {
                        Notification.success('Child group is been removed!');
                    }, error => {
                        throw error.data;
                    });
            } catch (error) {
                Notification.warning(error);
            }
        }
        /* jshint ignore:end */

        function getSettings(groupId) {
            return getGroup(groupId);
        }

        function getTypeTitle(type, groups) {
            const key = Object.keys(groupTypes).find(k => groupTypes[k] === type);
            return groups.length > 1 ? groupTypePluralLabels[key] || '' : groupTypeLabels[key];
        }

        function getGroupTypeLabel(type) {
            if (type === groupTypes.PROJECT)
                return 'Agreement';
            return groupTypeLabels[Object.keys(groupTypes).find(k => groupTypes[k] === type)] || '';
        }

        function getCollaborators(groupId) {
            return Restangular
                .one(`groups/${groupId}/get-collaborators`)
                .get();
        }

        /* jshint ignore:start */
        async function addCollaborator(group, user, active) {
            try {
                await Restangular
                    .one(`groups/${group.id}/add-collaborator`)
                    .customPUT({
                        user: user.id,
                        active: active
                    })
                    .then(() => {
                        Notification.success('Collaborator is been added!');
                    }, error => {
                        throw error.data;
                    });
            } catch (error) {
                Notification.warning(error);
            }
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function updateCollaborator(group, user, active) {
            try {
                await Restangular
                    .one(`groups/${group.id}`)
                    .one(`update-collaborator/${user.id}`)
                    .customPUT({
                        synchronized: false,
                        active: active
                    })
                    .then(() => {
                        Notification.success('Collaborator is been updated!');
                    }, error => {
                        throw error.data;
                    });
            } catch (error) {
                Notification.warning(error);
            }
        }
        /* jshint ignore:end */

        /* jshint ignore:start */
        async function removeCollaborator(group, user) {
            try {
                await Restangular
                    .one(`groups/${group.id}`)
                    .one(`remove-collaborator/${user.id}`)
                    .remove()
                    .then(() => {
                        Notification.success('Collaborator is been removed!');
                    }, error => {
                        throw error.data;
                    });
            } catch (error) {
                Notification.warning(error);
            }
        }
        /* jshint ignore:end */

        function isGroupAdmin (group, user) {
            if (!group || !_.has(group, 'administrators') || !user) {
                return false;
            }
            return group.administrators.some(administrator => administrator.id === user.id);
        }

        /* jshint ignore:start */
        async function saveProfile (researchEntityId, profile, coverImage = false) {
            const formData = new FormData();
            console.log(profile);
            formData.append('profile', JSON.stringify(profile));

            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            let response = await Restangular.one('researchentities', researchEntityId)
                .one('save-profile')
                .customPOST(formData, '', undefined, {'Content-Type': undefined});

            response = response.plain();

            if (_.isEmpty(response.errors)) {
                const updatedProfileResponse = await ResearchEntitiesService.getProfile(researchEntityId);

                EventsService.publish(EventsService.GROUP_PROFILE_SAVED, updatedProfileResponse.plain());
            }

            return response;
        };
        /* jshint ignore:end */
    }
}());
