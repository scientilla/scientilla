(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFilter', {
            templateUrl: 'partials/scientillaFilter.html',
            controller: scientillaFilter,
            controllerAs: 'vm',
            transclude: true,
            bindings: {
                onFilter: '&',
                searchFormStructure: '<',
                emptyListMessage: '@?',
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
        var vm = this;

        vm.onSubmit = onSubmit;
        vm.onSearch = onSearch;
        vm.onPageChange = onPageChange;
        vm.onStatus = onStatus;
        vm.search = search;
        vm.reset = reset;
        vm.pageSizes = [10, 20, 50, 100, 200];
        vm.currentPage = 1;

        // statuses
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;
        vm.STATUS_ERROR = 2;
        vm.advancedOpen = false;
        vm.advancedText = getAdvancedText(vm.advancedOpen);
        vm.toggleAdvanced = toggleAdvanced;

        vm.formVisible = true;

        var searchQuery = {};
        var onDataChangeDeregisterer = null;

        vm.$onInit = function () {
            vm.itemsPerPage = pageSize;
            vm.status = vm.STATUS_WAITING;

            if (_.isUndefined(vm.emptyListMessage))
                vm.emptyListMessage = "No results found";

            if (_.isUndefined(vm.filterLabel))
                vm.filterLabel = "Filter";

            if (_.isUndefined(vm.elements))
                vm.elements = [];

            onDataChangeDeregisterer = $scope.$watch('vm.elements', onDataChange, true);

            vm.search();
        };

        vm.$onDestroy = function () {
            onDataChangeDeregisterer();
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
            var where = {};

            _.forEach(searchValues,
                function (value, key) {
                    var struct = vm.searchFormStructure[key];

                    if (struct.inputType === 'select' && searchValues[key] === "?")
                        return;

                    var whereAdd = {};
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

        function onDataChange() {
            vm.totalItems = vm.elements.count || 0;
        }

        function refreshList() {
            setStatus(vm.STATUS_LOADING);
            var query = getQuery();

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
            var paginationQuery = {
                skip: (vm.currentPage - 1) * vm.itemsPerPage,
                limit: vm.itemsPerPage
            };

            return _.merge({}, paginationQuery, searchQuery);
        }

        function setStatus(status) {
            vm.status = status;
        }
    }
})();