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
                    getData: '&',
                    searchFormStructure: '<',
                    emptyListMessage: '@?',
                    filterLabel: '@?'
                }
            });


    scientillaFilter.$inject = [
        'pageSize'
    ];

    function scientillaFilter(pageSize) {
        var vm = this;

        vm.onSearch = onSearch;
        vm.onPageChange = onPageChange;
        vm.onStatus = onStatus;
        vm.search = search;
        vm.reset = reset;

        vm.itemsPerPage = pageSize;
        vm.currentPage = 1;
        vm.totalItems = 0;

        // statuses
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;

        var searchQuery = {};

        activate();

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

        function search() {
            var where = {};

            _.forEach(this.searchValues,
                    function (value, key) {

                        var struct = vm.searchFormStructure[key];

                        if (struct.inputType === 'select' && vm.searchValues[key] === "?")
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
            _.forEach(this.searchValues,
                    function (value, key) {

                        var struct = vm.searchFormStructure[key];
                        if (struct.inputType === 'select') {
                            vm.searchValues[key] = "?";
                        }
                        else {

                            if (struct.defaultValue)
                                vm.searchValues[key] = struct.defaultValue;
                            else
                                vm.searchValues[key] = '';
                        }
                    });
            vm.search();
        }

        // private

        function activate() {
            vm.status = vm.STATUS_WAITING;

            if (_.isUndefined(vm.emptyListMessage))
                vm.emptyListMessage = "No results found";

            if (_.isUndefined(vm.filterLabel))
                vm.filterLabel = "Filter";

            vm.searchValues = getSearchValues();

            vm.search();
        }

        function refreshList() {
            setStatus(vm.STATUS_LOADING);

            var query = getQuery();

            vm.getData()(query).then(function (list) {

                vm.totalItems = (vm.currentPage - 1) * pageSize + list.length;

                if (list.length > pageSize)
                    list.pop();

                vm.onFilter()(list);

                vm.message = list.length === 0 ? vm.emptyListMessage : "";
                setStatus(vm.STATUS_WAITING);
            });
        }

        function getQuery() {
            var paginationQuery = {
                skip: (vm.currentPage - 1) * pageSize,
                limit: pageSize + 1
            };

            return _.merge({}, paginationQuery, searchQuery);
        }

        function setStatus(status) {
            return vm.status = status;
        }

        function getSearchValues() {
            var searchValues = {};

            _.forEach(vm.searchFormStructure, function (value, key) {
                if (!_.isUndefined(value.defaultValue))
                    searchValues[key] = value.defaultValue;
            });

            return searchValues;

        }

    }
})();