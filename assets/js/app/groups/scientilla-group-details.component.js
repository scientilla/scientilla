/* global angular */
(function () {
    angular
        .module('groups')
        .component('scientillaGroupDetails', {
            controller: GroupDetailsController,
            templateUrl: 'partials/scientilla-group-details.html',
            controllerAs: 'vm',
            bindings: {
                groupParam: '<',
                activeTab: '@?'
            }
        });

    GroupDetailsController.$inject = [
        'GroupsService',
        'ResearchEntitiesService',
        'groupTypes',
        'path'
    ];

    function GroupDetailsController(
        GroupsService,
        ResearchEntitiesService,
        groupTypes,
        path
    ) {
        const vm = this;

        vm.groupTypes = groupTypes;

        vm.defaultTabIdentifiers = [
            {
                index: 0,
                slug: 'info',
                tabName: 'group-info'
            }, {
                index: 1,
                slug: 'members',
                tabName: 'group-members'
            }, {
                index: 2,
                slug: 'child-groups'
            }, {
                index: 3,
                slug: 'documents'
            }, {
                index: 4,
                slug: 'accomplishments'
            }, {
                index: 5,
                slug: 'projects'
            }, {
                index: 6,
                slug: 'patents'
            }, {
                index: 7,
                slug: 'documents-overview',
                tabName: 'overview-tab'
            }, {
                index: 8,
                slug: 'bibliometric-charts',
                tabName: 'metrics-tab'
            }
        ];

        vm.projectTabIdentifiers = [
            {
                index: 0,
                slug: 'info',
                tabName: 'group-info'
            }, {
                index: 1,
                slug: 'members'
            }, {
                index: 2,
                slug: 'documents'
            }, {
                index: 3,
                slug: 'accomplishments'
            }, {
                index: 4,
                slug: 'patents'
            }
        ];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            let query = {};
            if (/^\d+$/.test(vm.groupParam)) {
                query.where = { id: vm.groupParam };
            } else {
                query.where = { slug: vm.groupParam };
            }

            vm.group = await GroupsService.get(query);
            if (!vm.group) {
                return path.goTo('/404');
            }

            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);

            let redirect = false;
            if (vm.group.type === groupTypes.PROJECT) {
                const tab = vm.projectTabIdentifiers.find(t => t.slug === vm.activeTab);

                if (!tab) {
                    redirect = true;

                }
            } else {
                const tab = vm.defaultTabIdentifiers.find(t => t.slug === vm.activeTab);

                if (!tab) {
                    redirect = true;
                }
            }

            if (redirect) {
                return path.goTo(`/${ vm.group.slug }/info`);
            }
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {

        };
    }
})();
