/* global angular */
(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementsList', {
            templateUrl: 'partials/scientilla-agreements-list.html',
            controller: scientillaAgreementsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                section: '<'
            }
        });

    scientillaAgreementsList.$inject = [
        'ProjectService',
        '$element',
        'agreementDownloadFileName',
        'agreementExportUrl'
    ];

    function scientillaAgreementsList(
        ProjectService,
        $element,
        agreementDownloadFileName,
        agreementExportUrl
    ) {
        const vm = this;

        vm.name = 'agreements-list';
        vm.shouldBeReloaded = true;

        vm.agreements = [];
        vm.onFilter = onFilter;
        vm.exportDownload = agreements => ProjectService.exportDownload(agreements, 'csv', agreementDownloadFileName, agreementExportUrl);

        let query = {};

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query =Object.assign({type:'project_agreement'}, q);

            vm.agreements = await ProjectService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();