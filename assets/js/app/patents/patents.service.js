/* global angular */
(function () {
    angular.module("app").factory("PatentService", controller);

    controller.$inject = ['ResearchEntitiesService', '$http'];

    function controller(ResearchEntitiesService, $http) {

        return {
            get: ResearchEntitiesService.getPatents,
            getFamilies: ResearchEntitiesService.getPatentFamilies,
            exportDownload,
            onChange,
            handleQuery
        };

        function exportDownload(patents, format = 'csv') {
            const filename = 'Patents_Export.csv';
            $http.post('/api/v1/patents/export', {
                format: format,
                patentIds: patents.map(d => d.id)
            }).then((res) => {
                const element = document.createElement('a');
                element.setAttribute('href', encodeURI(res.data));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            });
        }

        function setStructureYear(structure, minMaxYear) {
            if (minMaxYear && minMaxYear.min) {
                structure.year.floor = parseInt(minMaxYear.min);
            } else {
                structure.year.floor = parseInt(new Date().getFullYear());
            }

            if (minMaxYear && minMaxYear.max) {
                structure.year.ceil = parseInt(minMaxYear.max);
            } else {
                structure.year.ceil = parseInt(new Date().getFullYear());
            }
        }

        function setMinMaxYears(structure, values) {

            if (values.translation) {
                setStructureYear(structure, structure.year.minMaxYears.find(v => v.key === 'all_translations').values);
            } else {
                switch (values.type) {
                    case allPatentTypes.value:
                        setStructureYear(structure, structure.year.minMaxYears.find(v => v.key === allPatentTypes.value).values);
                        break;
                    case patentTypePriorities:
                        setStructureYear(structure, structure.year.minMaxYears.find(v => v.key === patentTypePriorities).values);
                        break;
                    case patentTypeProsecutions:
                        setStructureYear(structure, structure.year.minMaxYears.find(v => v.key === patentTypeProsecutions).values);
                        break;
                    default:
                        break;
                }
            }
        }

        function onChange(structure, values, key) {
            switch (key) {
                case 'type':
                    switch (values[key]) {
                        case allPatentTypes.value:
                            structure.translation.disabled = false;
                            setMinMaxYears(structure, values);
                            break;
                        case patentTypePriorities:
                            structure.translation.disabled = true;
                            values.translation = false;
                            setMinMaxYears(structure, values);
                            break;
                        case patentTypeProsecutions:
                            structure.translation.disabled = true;
                            values.translation = false;
                            setMinMaxYears(structure, values);
                            break;
                        default:
                            break;
                    }
                    break;
                case 'translation':
                    setMinMaxYears(structure, values);
                    break;
                default:
                    break;
            }
        }

        function handleQuery(query) {
            if (!_.has(query, 'where.type')) {
                return;
            }

            switch (true) {
                case query.where.type === 'prosecutions':
                    query.where.translation = false;
                    query.where.priority = false;
                    break;
                case query.where.type === 'priorities':
                    query.where.translation = false;
                    query.where.priority = true;
                    break;
                case query.where.type === 'all' && _.has(query, 'where.translation') && query.where.translation:
                    delete query.where.translation;
                    delete query.where.priority;
                    query.where.or = [
                        {
                            issueYear: query.where.issueYear,
                            translation: true
                        }, {
                            filingYear: query.where.issueYear,
                            translation: false
                        }
                    ];
                    delete query.where.issueYear;
                    break;
                case query.where.type === 'all' && (
                    !_.has(query, 'where.translation') ||
                    (
                        _.has(query, 'where.translation') &&
                        !query.where.translation
                    )
                ):
                    delete query.where.or;
                    query.where.translation = false;
                    delete query.where.priority;
                    break;
                default:
                    break;
            }

            delete query.where.type;

            return query;
        }
    }
})();