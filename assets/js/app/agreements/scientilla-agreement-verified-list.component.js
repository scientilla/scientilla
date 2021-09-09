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
        'ProjectService',
        'EventsService',
        'agreementListSections',
        'context',
        'ModalService',
        'agreementDownloadFileName',
        'agreementExportUrl'
    ];

    function controller(
        ProjectService,
        EventsService,
        agreementListSections,
        context,
        ModalService,
        agreementDownloadFileName,
        agreementExportUrl
    ) {
        const vm = this;

        vm.agreementListSections = agreementListSections;
        vm.agreements = [];
        vm.onFilter = onFilter;
        vm.unverify = (agreement) => ProjectService.unverify(vm.researchEntity, agreement);
        vm.exportDownload = agreements => ProjectService.exportDownload(agreements, 'csv', agreementDownloadFileName, agreementExportUrl);

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

        /* jshint ignore:end */
    }

})();