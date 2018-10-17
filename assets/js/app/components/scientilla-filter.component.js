(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFilter', {
            templateUrl: 'partials/scientilla-filter.html',
            controller: scientillaFilter,
            controllerAs: 'vm',
            transclude: true,
            bindings: {
                onFilter: '&',
                searchFormStructure: '<',
                filterLabel: '@?',
                elements: '<?'
            }
        });


    scientillaFilter.$inject = [
        'pageSize',
        '$scope',
        '$timeout'
    ];

    function scientillaFilter(pageSize, $scope, $timeout) {
        const vm = this;

        vm.onSubmit = onSubmit;
        vm.onSearch = onSearch;
        vm.onPageChange = onPageChange;
        vm.onStatus = onStatus;
        vm.search = search;
        vm.reset = reset;
        vm.pageSizes = [10, 20, 50, 100, 200];
        vm.currentPage = 1;

        vm.filterSearchFormStructure = {};

        // statuses
        vm.STATUS_INITIAL_LOADING = 0;
        vm.STATUS_WAITING = 1;
        vm.STATUS_LOADING = 2;
        vm.STATUS_ERROR = 3;
        vm.advancedOpen = false;
        vm.advancedText = getAdvancedText(vm.advancedOpen);
        vm.toggleAdvanced = toggleAdvanced;
        let statusTimeoutId = null;

        vm.formVisible = true;
        vm.filterIsCollapsed = true;

        let searchQuery = {};
        let onDataCountChangeDeregisterer = null;

        vm.$onInit = function () {
            vm.itemsPerPage = pageSize;
            vm.status = vm.STATUS_INITIAL_LOADING;

            if (_.isUndefined(vm.filterLabel))
                vm.filterLabel = "Filter";

            if (_.isUndefined(vm.elements))
                vm.elements = [];

            onDataCountChangeDeregisterer = $scope.$watch('vm.elements.count', onDataCountChange, true);

            vm.filterSearchFormStructure = _.assign({}, vm.searchFormStructure, {
                buttonSearch: {
                    inputType: 'submit',
                    label: vm.filterLabel,
                    type: 'action'
                },
                buttonReset: {
                    inputType: 'button',
                    label: 'Reset',
                    onClick: 'reset',
                    type: 'action'
                },
                itemsPerPage: {
                    inputType: 'select',
                    label: 'Items per page',
                    defaultValue: pageSize,
                    values: vm.pageSizes.map(ps => ({value: ps, label: ps})),
                    labelPosition: 'inline',
                    cssClass: 'items-per-page',
                    onChange: 'submit',
                    type: 'action'
                }
            });

        };

        vm.$onDestroy = function () {
            onDataCountChangeDeregisterer();
        };

        function onSubmit(searchValues) {
            return !vm.onStatus(vm.STATUS_LOADING) && vm.search(searchValues);
        }

        function onSearch(searchWhere) {
            vm.currentPage = 1;
            searchQuery = {where: searchWhere};

            refreshList();
        }

        function onPageChange() {
            refreshList();
        }


        function onStatus(status) {
            return vm.status === status;
        }

        function search(searchValues) {
            let where = {};

            if (searchValues && searchValues.itemsPerPage)
                vm.itemsPerPage = searchValues.itemsPerPage;

            _.forEach(searchValues,
                function (value, key) {
                    if (key === 'itemsPerPage')
                        return;

                    const struct = vm.searchFormStructure[key];

                    if (struct.inputType === 'select' && searchValues[key] === "?")
                        return;

                    const whereAdd = {};
                    if (!struct.matchRule) {
                        whereAdd[struct.matchColumn] = value;
                    }
                    else if (struct.matchRule === 'is null') {
                        if (!value)
                            whereAdd[struct.matchColumn] = null;
                    }
                    else {
                        whereAdd[struct.matchColumn] = {};
                        whereAdd[struct.matchColumn][struct.matchRule] = value;
                    }
                    where = _.merge(where, whereAdd);
                });
            vm.onSearch(where);
        }

        function reset() {
            vm.formReset();
            vm.search();
        }

        function toggleAdvanced() {
            vm.advancedOpen = !vm.advancedOpen;
            vm.advancedText = getAdvancedText(vm.advancedOpen);
        }

        // private

        function getAdvancedText(open) {
            return open ? '<' : '>';
        }

        function onDataCountChange() {
            vm.totalItems = vm.elements.count || 0;
        }

        function refreshList() {
            if (!onStatus(vm.STATUS_INITIAL_LOADING))
                setStatus(vm.STATUS_LOADING);

            const query = getQuery();

            vm.onFilter()(query)
                .then(function () {
                    setStatus(vm.STATUS_WAITING);
                })
                .catch(function (err) {
                    vm.elements = [];
                    setStatus(vm.STATUS_ERROR);
                });
        }

        function getQuery() {
            const paginationQuery = {
                skip: (vm.currentPage - 1) * vm.itemsPerPage,
                limit: vm.itemsPerPage
            };

            return _.merge({}, paginationQuery, searchQuery);
        }

        function setStatus(status) {
            if (statusTimeoutId)
                $timeout.cancel(statusTimeoutId);
            if (status === vm.STATUS_LOADING) {
                vm.status = vm.STATUS_WAITING;
                statusTimeoutId = $timeout(() => vm.status = vm.STATUS_LOADING, 400);
                return;
            }
            vm.status = status;
        }
    }
})();