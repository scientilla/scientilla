(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFilter', {
            templateUrl: 'partials/scientilla-filter.html',
            controller: scientillaFilter,
            controllerAs: 'vm',
            transclude: true,
            bindings: {
                prefix: '@?',
                onFilter: '&',
                category: '@',
                filterLabel: '@?',
                elements: '<?'
            }
        });


    scientillaFilter.$inject = [
        'ResearchItemTypesService',
        'pageSize',
        '$scope',
        '$timeout',
        'ResearchItemSearchFormStructureService',
        '$location',
        '$routeParams'
    ];

    function scientillaFilter(
        ResearchItemTypesService,
        pageSize,
        $scope,
        $timeout,
        ResearchItemSearchFormStructureService,
        $location,
        $routeParams
    ) {
        const vm = this;

        vm.onSubmit = onSubmit;
        vm.onReset = onReset;
        vm.onSearch = onSearch;
        vm.onPageChange = onPageChange;
        vm.onStatus = onStatus;
        vm.search = search;
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

        vm.values = {};

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.itemsPerPage = pageSize;
            vm.status = vm.STATUS_INITIAL_LOADING;

            if (_.isUndefined(vm.filterLabel))
                vm.filterLabel = "Filter";

            if (_.isUndefined(vm.elements))
                vm.elements = [];

            onDataCountChangeDeregisterer = $scope.$watch('vm.elements.count', onDataCountChange, true);

            vm.searchFormStructure = await ResearchItemSearchFormStructureService.getStructure(vm.category);

            vm.searchFormStructure = _.assign({}, vm.searchFormStructure, {
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
                    valueType: 'integer',
                    label: 'Items per page',
                    defaultValue: pageSize,
                    values: vm.pageSizes.map(ps => ({value: ps, label: ps})),
                    labelPosition: 'inline',
                    cssClass: 'items-per-page',
                    onChange: 'submit',
                    type: 'action'
                }
            });

            // Add the prefix to all keys of the form structure when the prefix is provided
            if (!_.isUndefined(vm.prefix)) {
                vm.filterSearchFormStructure = {};

                for (const key of Object.keys(vm.searchFormStructure)) {
                    vm.filterSearchFormStructure[vm.prefix + '_' + key] = vm.searchFormStructure[key];
                }
            } else {
                vm.filterSearchFormStructure = _.cloneDeep(vm.searchFormStructure);
            }

            handleRouteParams();
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            onDataCountChangeDeregisterer();
        };

        function onSubmit(searchValues) {
            if (!vm.onStatus(vm.STATUS_LOADING)) {
                // Get current search parameters from URL
                const params = $routeParams;

                // Loop over the filter values and
                _.forEach(searchValues, function (value, key) {
                    // Get the settings of the field
                    const struct = vm.filterSearchFormStructure[key];

                    // Skip if nothing is selected if the inputType is a select
                    if (struct.inputType === 'select' && searchValues[key] === "?")
                        return;

                    // Skip if the value is null
                    if (value === null) {
                        return;
                    }

                    // Add value to the params array setted by the key.
                    params[key] = value;
                });

                // Change search with new parameters, this will change URL
                $location.search(params);
            }
        }

        function onReset() {
            const params = {};

            // Get the current search parameters from URL
            const originalParams = $routeParams;

            // Loop over them
            for (const paramKey of Object.keys(originalParams)) {
                // If the parameter is not one of the current filter structure we keep it
                if (!_.has(vm.filterSearchFormStructure, paramKey)) {
                    params[paramKey] = originalParams[paramKey];
                }
            }

            // Change search with new parameters, this will change URL
            $location.search(params);
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

            // Set the itemsPerPage depending on prefix & selected value
            if (searchValues) {
                if (!_.isUndefined(vm.prefix) && searchValues[vm.prefix + '_itemsPerPage']) {
                    vm.itemsPerPage = searchValues[vm.prefix + '_itemsPerPage'];
                } else {
                    if (searchValues.itemsPerPage) {
                        vm.itemsPerPage = searchValues.itemsPerPage;
                    }
                }
            }

            // Loop over the search values
            _.forEach(searchValues, function (value, key) {
                // We skip this item if the current item is itemsPerPage
                if (
                    (!_.isUndefined(vm.prefix) && key === vm.prefix + '_itemsPerPage') ||
                    (_.isUndefined(vm.prefix) && key === 'itemsPerPage')
                ) {
                    return;
                }

                const struct = vm.filterSearchFormStructure[key];

                // We skip this item if the struct doesn't exist or is it an select without any selected value
                if (!struct || (struct.inputType === 'select' && searchValues[key] === "?")) {
                    return;
                }

                // We set the where query
                const whereAdd = {};
                if (!struct.matchRule) {
                    // Check if the type is an checkbox and cast the value to a boolean
                    if (struct.type === 'checkbox') {
                        whereAdd[struct.matchColumn] = (value === 'true');
                    } else {
                        whereAdd[struct.matchColumn] = value;
                    }
                } else if (struct.matchRule === 'is null') {
                    // If field option has matchRule equal to 'is null'
                    if (!value) {
                        // And the value is not true we add it to the query
                        whereAdd[struct.matchColumn] = null;
                    }
                } else {
                    // If option matchRule is not 'is null' create object with the rule & value
                    whereAdd[struct.matchColumn] = {};
                    whereAdd[struct.matchColumn][struct.matchRule] = value;
                }

                // Merge where queries
                where = _.merge(where, whereAdd);
            });

            // Execute onSearch function with new query
            vm.onSearch(where);
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
                statusTimeoutId = $timeout(() => {
                    vm.status = vm.STATUS_LOADING;
                    window.scrollTo(0,0);
                }, 400);
                return;
            }
            vm.status = status;
        }

        function handleRouteParams() {
            let executeSearch = true;

            // Loop over the route parameters
            for (const param of Object.keys($routeParams)) {
                // Check if the parameter exists in the current form structure
                if (_.has(vm.filterSearchFormStructure, param)) {
                    // Check if settings of the field has a valueType property
                    if (_.has(vm.filterSearchFormStructure[param], 'valueType')) {
                        // Check which type it is
                        switch (vm.filterSearchFormStructure[param].valueType) {
                            // If it's an integer
                            case 'integer':
                                // Parse to integer
                                vm.values[param] = parseInt($routeParams[param]);
                                break;
                            // If it's a boolean
                            case 'boolean':
                                // If the type of the parameter is a string cast it to a boolean
                                if (typeof $routeParams[param] === 'string') {
                                    vm.values[param] = ($routeParams[param] === 'true');
                                }

                                // If the type of the parameter is a boolean
                                // copy the value into the values object by the key
                                if (typeof $routeParams[param] === 'boolean') {
                                    vm.values[param] = $routeParams[param];
                                }
                                break;
                            default:
                                // By default: copy the value into the values object by the key
                                vm.values[param] = $routeParams[param];
                                break;
                        }
                    } else {
                        // Copy the value of the parameter into the values object by the key
                        vm.values[param] = $routeParams[param];
                    }
                }
            }

            // If the values object has a property with the name itemsPerPage
            if (_.has(vm.values, 'itemsPerPage')) {
                // Check if the value is one of the defaults
                if (_.indexOf(vm.pageSizes, vm.values.itemsPerPage) < 0) {
                    // Set the default
                    vm.values.itemsPerPage = pageSize;
                    // Prevent searching
                    executeSearch = false;
                }

                // Set variable
                vm.itemsPerPage = vm.values.itemsPerPage;
            }

            // If we can proceed searching
            if (executeSearch) {
                search(vm.values);
            } else {
                // Execute the re-submit in the same tick or a later tick
                // https://www.bennadel.com/blog/2605-scope-evalasync-vs-timeout-in-angularjs.htm
                $scope.$evalAsync(() => {
                    // Re-submit with modified values
                    onSubmit(vm.values);
                });
            }
        }
    }
})();