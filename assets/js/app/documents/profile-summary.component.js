(function () {
    angular
        .module('documents')
        .component('profileSummary', {
            templateUrl: 'partials/profile-summary.html',
            controller: ProfileSummaryComponent,
            controllerAs: 'vm'
        });

    ProfileSummaryComponent.$inject = [
        'context',
        'DocumentTypesService'
    ];

    function ProfileSummaryComponent(context, DocumentTypesService) {
        const vm = this;
        vm.researchEntity = context.getResearchEntity();
        vm.documentsByYear = {};
        vm.documentsByType = {};

        vm.documentsByYear.options = {
            chart: {
                type: 'historicalBarChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 65,
                    left: 50
                },
                x: d => d.year,
                y: d => d.count,
                showValues: true,
                duration: 100,
                xAxis: {
                    axisLabel: 'Year',
                    rotateLabels: 50,
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: '# documents',
                    axisLabelDistance: -10
                }
            }
        };

        vm.documentsByYear.data = [
            {
                "key": "Quantity",
                "bar": true,
                "values": []
            }];

        vm.documentsByType.data = [];

        vm.documentsByType.options = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function (d) {
                    return d.type;
                },
                y: function (d) {
                    return d.count;
                },
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };

        vm.$onInit = () => {
            vm.researchEntity
                .all('charts')
                .getList()
                .then(chartsData => {
                    const data = chartsData[0].map(d => ({
                        year: parseInt(d.year),
                        count: parseInt(d.count)
                    }));
                    console.log(data);
                    const minYear = _.isEmpty(data) ? 0:_.minBy(data, 'year').year;
                    const maxYear = _.isEmpty(data) ? 0:_.maxBy(data, 'year').year;
                    _.range(minYear, maxYear)
                        .forEach(y => {
                            if (!_.find(data, {year: y}))
                                data.push({count: 0, year: y});
                        });
                    vm.documentsByYear.data[0].values = data;

                    const data2 = chartsData[1].map(d => ({
                        type: DocumentTypesService.getDocumentTypeLabel(d.type),
                        count: parseInt(d.count)
                    }));
                    vm.documentsByType.data = data2;
                });
        };
    }
})();