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
                    emptyListMessage: '<?',
                    filterLabel: '<?'
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

        vm.itemsPerPage = pageSize;
        vm.currentPage = 1;
        vm.totalItems = 0;

        // statuses
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;

        vm.status = vm.STATUS_WAITING;

        if (vm.emptyListMessage === undefined)
            vm.emptyListMessage = "No results found";

        var searchQuery = {};


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

        // private

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

    }


})();