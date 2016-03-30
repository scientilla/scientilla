(function () {
    'use strict';

    angular.module('components')
            .component('scientillaFilter', {
                templateUrl: 'partials/scientillaFilter.html',
                controller: scientillaFilter,
                controllerAs: 'vm',
                bindings: {
                    onFilter: '&',
                    getData: '&',
                    searchFormStructure: '<'
                }
            });


    scientillaFilter.$inject = [
        'pageSize'
    ];

    function scientillaFilter(pageSize) {
        var vm = this;

        vm.onSearch = onSearch;
        vm.onPageChange = onPageChange;

        vm.itemsPerPage = pageSize;
        vm.currentPage = 1;
        vm.totalItems = 0;

        var searchQuery = {};

        refreshList();

        function onSearch(searchWhere) {
            vm.currentPage = 1;
            searchQuery = {where: searchWhere};

            refreshList();
        }
        function onPageChange() {
            refreshList();
        }

        // private

        function refreshList() {
            var query = getQuery();

            vm.getData()(query).then(function (list) {

                vm.totalItems = (vm.currentPage - 1) * pageSize + list.length;

                if (list.length > pageSize)
                    list.pop();

                vm.onFilter()(list);
            });

        }

        function getQuery() {
            var paginationQuery = {
                skip: (vm.currentPage - 1) * pageSize,
                limit: pageSize + 1
            };


            return _.merge({}, paginationQuery, searchQuery);
        }

    }


})();