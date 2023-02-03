/* global angular */
(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementVerifiedList', {
            templateUrl: 'partials/scientilla-agreement-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'AgreementService',
        'ProjectService',
        'EventsService',
        'agreementListSections',
        'context',
        'ModalService',
        'agreementDownloadFileName',
        'agreementExportUrl',
        'GroupsService'
    ];

    function controller(
        AgreementService,
        ProjectService,
        EventsService,
        agreementListSections,
        context,
        ModalService,
        agreementDownloadFileName,
        agreementExportUrl,
        GroupsService
    ) {
        const vm = this;

        vm.agreementListSections = agreementListSections;
        vm.agreements = [];
        vm.onFilter = onFilter;
        vm.unverify = (agreement) => ProjectService.unverify(vm.researchEntity, agreement);
        vm.exportDownload = agreements => AgreementService.exportDownload(agreements, agreementDownloadFileName, agreementExportUrl, 'csv');
        vm.subResearchEntity = context.getSubResearchEntity();

        let query = {
            where: {}
        };

        const agreementPopulates = ['type', 'verified', 'verifiedUsers', 'verifiedGroups', 'group', 'authors', 'affiliations'];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED,
                EventsService.PROJECT_GROUP_CREATED
            ], updateList);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        vm.generateGroup = function (agreement) {
            ModalService.openGenerateAgreementGroup(agreement);
        };

        function updateList() {
            return onFilter(query);
        }

        /* jshint ignore:start */
        async function onFilter(q) {
            q.where.type = 'project_agreement'

            vm.agreements = await ProjectService.get(vm.researchEntity, q, false, agreementPopulates);
        }

        vm.editAdmins = async agreement => {
            if (agreement.group) {
                const group = await GroupsService.getGroup(agreement.group.id);
                ModalService.openScientillaAgreementAdminForm(group);
            }
        };
        /* jshint ignore:end */
    }

})();
