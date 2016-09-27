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

        vm.onSearch = onSearch;
        vm.onPageChange = onPageChange;
        vm.onStatus = onStatus;
        vm.search = search;
        vm.reset = reset;
        vm.pageSizes = [10, 20, 50, 100, 200];
        vm.currentPage = 1;
        vm.totalItems = 0;
        vm.searchValues = {};

        // statuses
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;
        vm.STATUS_ERROR = 2;
        vm.advancedOpen = false;
        vm.advancedText = getAdvancedText(vm.advancedOpen);
        vm.toggleAdvanced = toggleAdvanced;

        vm.formVisible = true;

        var searchQuery = {};
        var onChangeWatchesDeregisters = [];
        var formStructureDeregisterer = null;

        vm.$onInit = function () {
            vm.itemsPerPage = pageSize;
            vm.status = vm.STATUS_WAITING;

            if (_.isUndefined(vm.emptyListMessage))
                vm.emptyListMessage = "No results found";

            if (_.isUndefined(vm.filterLabel))
                vm.filterLabel = "Filter";

            initSearchValues();

            formStructureDeregisterer = $scope.$watch('vm.searchFormStructure', refreshForm, true);

            vm.search();
        };

        vm.$onDestroy = function () {
            deregisterOnChanges();
            formStructureDeregisterer();
        };

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

        function toggleAdvanced() {
            vm.advancedOpen = !vm.advancedOpen;
            vm.advancedText = getAdvancedText(vm.advancedOpen);
        }

        // private

        function getAdvancedText(open) {
            return open ? '<' : '>';
        }

        function refreshList() {
            setStatus(vm.STATUS_LOADING);

            var query = getQuery();

            vm.getData()(query)
                .then(function (list) {

                    vm.totalItems = (vm.currentPage - 1) * vm.itemsPerPage + list.length;

                    if (list.length > vm.itemsPerPage)
                        list.pop();

                    vm.elements = list;
                    vm.onFilter()(list);

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
                limit: vm.itemsPerPage + 1
            };

            return _.merge({}, paginationQuery, searchQuery);
        }

        function setStatus(status) {
            return vm.status = status;
        }

        function initSearchValues() {
            deregisterOnChanges();

            var oldSearchValues = _.cloneDeep(vm.searchValues);
            vm.searchValues = {};

            _.forEach(vm.searchFormStructure, function (value, key) {
                if(!_.isUndefined(oldSearchValues[key]))
                    vm.searchValues[key] = oldSearchValues[key];
                else if (!_.isUndefined(value.defaultValue))
                    vm.searchValues[key] = value.defaultValue;
                if (!_.isUndefined(value.onChange))
                    onChangeWatchesDeregisters.push($scope.$watch('vm.searchValues.' + key, value.onChange));
            });
        }

        function deregisterOnChanges() {
            _.forEach(onChangeWatchesDeregisters, function (deregister) {
                deregister();
            });
            onChangeWatchesDeregisters = [];
        }

        function refreshForm() {

            initSearchValues();

            vm.formVisible = false;
            $timeout(function () {
                vm.formVisible = true;
            }, 0);
        }
    }
})();