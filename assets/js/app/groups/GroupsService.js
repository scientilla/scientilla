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
        'groupTypePluralLabels'
    ];

    function GroupService(
        Restangular,
        Prototyper,
        Notification,
        groupTypes,
        groupTypeLabels,
        groupTypePluralLabels
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
        service.addRelative = addRelative;
        service.removeChild = removeChild;
        service.getSettings = getSettings;
        service.getConnectedGroups = getConnectedGroups;
        service.getMembershipGroups = getMembershipGroups;
        service.getParentMembershipGroups = getParentMembershipGroups;
        service.getTypeTitle = getTypeTitle;
        service.createInstituteStructure = createInstituteStructure;
        service.getGroupTypeLabel = getGroupTypeLabel;
        service.getCollaborators = getCollaborators;
        service.removeMembership = removeMembership;
        service.isGroupAdmin = isGroupAdmin;

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

        function getParentMembershipGroups(groupId) {
            return Restangular.all('membershipgroups').customGET('', {
                where: {child_group: groupId},
                populate: ['parent_group', 'child_group']
            }).then(res => {
                return res.items;
            });
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
                /*where: {
                   child_group: groupId
                },*/
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
        async function addCollaborator(group, user, active) {
            try {
                const newMembership = {
                    group: group.id,
                    user: user.id,
                    active: active,
                    synchronized: false
                };

                await Restangular
                    .all('memberships')
                    .customPOST(newMembership)
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
                const qs = {where: {group: group.id, user: user.id}};
                const res = await Restangular.all('memberships').customGET('', qs);
                if (res.items.length !== 1) {
                    throw 'Membership not found!';
                }
                const membership = res.items[0];
                membership.synchronized = false;
                membership.active = active;

                await Restangular
                    .one('memberships', membership.id)
                    .customPOST(membership)
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
                const qs = {where: {group: group.id, user: user.id}};
                let res = await Restangular.all('memberships').customGET('', qs);
                if (res.items.length !== 1) {
                    throw 'Membership not found!';
                }
                await Restangular
                    .one('memberships', res.items[0].id)
                    .remove()
                    .then(() => {
                        Notification.success('Membership removed!');
                    }, error => {
                        throw error.data;
                    });
            } catch (error) {
                Notification.warning(error);
            }
        }
        /* jshint ignore:end */

        function addRelative(parent, child) {
            const newMembership = {
                parent_group: parent.id,
                child_group: child.id
            };
            return Restangular
                .all('membershipgroups')
                .customPOST(newMembership);
        }

        function removeChild(parent, child) {
            const qs = {where: {parent_group: parent.id, child_group: child.id}};
            return Restangular.all('membershipgroups').customGET('', qs)
                .then(res => {
                    if (!res.items[0]) return;

                    return Restangular
                        .one('membershipgroups', res.items[0].id)
                        .remove();
                });
        }

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
                .one(`memberships/${groupId}/get-collaborators`)
                .get();
        }

        function removeMembership(id) {
            return Restangular
                .one('memberships', id)
                .remove();
        }

        function isGroupAdmin (group, user) {
            if (!group || !_.has(group, 'administrators') || !user) {
                return false;
            }
            return group.administrators.some(administrator => administrator.id === user.id);
        }
    }
}());
