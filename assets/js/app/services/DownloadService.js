(function () {
    "use strict";
    angular.module("services").factory("DownloadService", DownloadService);

    DownloadService.$inject = [];

    function DownloadService() {
        let service = {};

        service.download = (data, name, format) => {
            const timestamp = new Date().toISOString()
                .replace('T', '_')
                .replace(/[:\-]/g, '')
                .slice(0, 17) + new Date().getMilliseconds();

            const filenames = {
                csv: `Export-${name}-${timestamp}.csv`,
                bibtex: `Export-${name}-${timestamp}.bib`,
                excel: `Export-${name}-${timestamp}.xlsx`
            };

            const filename = filenames[format];

            const contentTypes = {
                csv: 'text/csv',
                bibtex: 'text/plain',
                excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };

            const contentType = contentTypes[format];
            const blob = new Blob([data], {type: contentType});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        };

        return service;
    }
})();