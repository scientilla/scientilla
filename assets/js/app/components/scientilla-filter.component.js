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
        'context'
    ];

    function scientillaFilter(
        ResearchItemTypesService,
        pageSize,
        $scope,
        $timeout,
        ResearchItemSearchFormStructureService,
        $location,
        context
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

        vm.changeCollapse = function() {
            vm.filterIsCollapsed = !vm.filterIsCollapsed;

            $timeout(function() {
                $scope.$broadcast('rzSliderForceRender');
            });
        };

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            vm.itemsPerPage = pageSize;
            vm.status = vm.STATUS_INITIAL_LOADING;

            if (_.isUndefined(vm.filterLabel))
                vm.filterLabel = "Filter";

            if (_.isUndefined(vm.elements))
                vm.elements = [];

            onDataCountChangeDeregisterer = $scope.$watch('vm.elements', onDataCountChange, true);

            vm.searchFormStructure = await ResearchItemSearchFormStructureService.getStructure(vm.category, vm.researchEntity);

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
            if (typeof onDataCountChangeDeregisterer === "function") {
                onDataCountChangeDeregisterer();
            }
        };

        function onSubmit(values) {
            vm.values = values;
            if (!vm.onStatus(vm.STATUS_LOADING)) {
                // Get current search parameters from URL
                const params = $location.search();

                // Filter out
                _.forEach(vm.filterSearchFormStructure, function (value, key) {
                    if (_.has(params, key)) {
                        delete params[key];
                    }
                });

                // Loop over the filter values and
                _.forEach(vm.values, function (value, key) {

                    // Get the settings of the field
                    const struct = vm.filterSearchFormStructure[key];

                    // Skip if nothing is selected if the inputType is a select
                    if (
                        struct &&
                        (
                            (struct.inputType === 'select' && vm.values[key] === '?') ||
                            (struct.inputType === 'radio' && vm.values[key] === 'all')
                        )
                    ){
                        return;
                    }

                    // Skip if the value is null
                    if (typeof value === 'string' &&_.isEmpty(value)) {
                        return;
                    }

                    if (value === null) {
                        return;
                    }

                    // Add value to the params array setted by the key.
                    params[key] = value;
                });

                // Change search with new parameters, this will change URL but not reload
                const path = $location.path();
                const queryString = Object.keys(params).map((key) => {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');

                let url = path;
                if (queryString.length > 0) {
                    url += '?' + queryString;
                }

                if (!_.isEmpty(params)) {
                    $location.url(url, false);
                }

                // Search
                search();
            }
        }

        function onReset() {
            const path = $location.path();
            $location.path(path);
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

        function search() {
            let where = {};

            // Set the itemsPerPage depending on prefix & selected value
            if (vm.values) {
                if (!_.isUndefined(vm.prefix) && vm.values[vm.prefix + '_itemsPerPage']) {
                    vm.itemsPerPage = vm.values[vm.prefix + '_itemsPerPage'];
                } else {
                    if (vm.values.itemsPerPage) {
                        vm.itemsPerPage = vm.values.itemsPerPage;
                    }
                }
            }

            // Loop over the search values
            _.forEach(vm.values, function (value, key) {
                // We skip this item if the current item is itemsPerPage
                if (
                    (!_.isUndefined(vm.prefix) && key === vm.prefix + '_itemsPerPage') ||
                    (_.isUndefined(vm.prefix) && key === 'itemsPerPage')
                ) {
                    return;
                }

                const struct = vm.filterSearchFormStructure[key];

                // We skip this item if the struct doesn't exist or is it an select without any selected value
                if (!struct || (struct.inputType === 'select' && vm.values[key] === "?")) {
                    return;
                }

                if (_.has(struct, 'skip') && struct.skip) {
                    return;
                }

                // We set the where query
                const whereAdd = {};

                if (_.has(struct, 'match') && _.isArray(struct.match)) {
                    const or = [];
                    _.forEach(struct.match, match => {
                        if (_.has(match, 'rule') && _.has(match,'column')) {
                            const orItem = {};
                            orItem[match.column] = {};
                            orItem[match.column][match.rule] = value;
                            or.push(orItem);
                        }
                    });

                    whereAdd.or = or;
                } else {
                    if (struct.inputType === 'range' && _.has(struct, 'rules') && _.isArray(struct.rules)) {
                        whereAdd[struct.matchColumn] = {};

                        _.forEach(struct.rules, rule => {
                            if (_.has(rule, 'rule') && _.has(rule, 'value')) {
                                whereAdd[struct.matchColumn][rule.rule] = value[rule.value];
                            }
                        });
                    } else {
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
                    }
                }

                // Merge where queries
                _.merge(where, whereAdd);
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

        /* jshint ignore:start */
        async function refreshList() {
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
        /* jshint ignore:end */

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

            // Get current search parameters from URL
            const originalParams = $location.search();

            // Loop over the route parameters
            for (const param of Object.keys(originalParams)) {
                // Check if the parameter exists in the current form structure
                if (_.has(vm.filterSearchFormStructure, param)) {
                    // Check if settings of the field has a valueType property
                    if (_.has(vm.filterSearchFormStructure[param], 'valueType')) {
                        // Check which type it is
                        switch (vm.filterSearchFormStructure[param].valueType) {
                            // If it's an integer
                            case 'integer':
                                // Parse to integer
                                vm.values[param] = parseInt(originalParams[param]);
                                break;
                            // If it's a boolean
                            case 'boolean':
                                // If the type of the parameter is a string cast it to a boolean
                                if (typeof originalParams[param] === 'string') {
                                    vm.values[param] = (originalParams[param] === 'true');
                                }

                                // If the type of the parameter is a boolean
                                // copy the value into the values object by the key
                                if (typeof originalParams[param] === 'boolean') {
                                    vm.values[param] = originalParams[param];
                                }
                                break;
                            default:
                                // By default: copy the value into the values object by the key
                                vm.values[param] = originalParams[param];
                                break;
                        }
                    } else {
                        // Copy the value of the parameter into the values object by the key
                        vm.values[param] = originalParams[param];
                    }
                }
            }

            // Check if the itemsPerPage is valid
            if (!_.isUndefined(vm.prefix)) {
                if (_.has(vm.values, vm.prefix + '_itemsPerPage')) {
                    // Check if the value is one of the defaults
                    if (_.indexOf(vm.pageSizes, vm.values[vm.prefix + '_itemsPerPage']) < 0) {
                        // Set the default
                        vm.values[vm.prefix + '_itemsPerPage'] = pageSize;
                        // Prevent searching
                        executeSearch = false;
                    }

                    // Set variable
                    vm.itemsPerPage = vm.values[vm.prefix + '_itemsPerPage'];
                }
            } else {
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
            }

            _.forEach(vm.filterSearchFormStructure, function (value, key) {
                if (!_.has(vm.values, key) && _.has(value, 'defaultValue')) {
                    vm.values[key] = value.defaultValue;
                }
            });

            // If we can proceed searching
            if (executeSearch) {
                search(vm.values);
            } else {
                // Execute the re-submit
                onSubmit(vm.values);
            }
        }
    }
})();