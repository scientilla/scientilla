(function () {
    'use strict';


    var years = _.range(new Date().getFullYear(), 2005, -1);


    angular.module('components')
            .constant('pageSize', 10)
            .constant('yearsInterval', years);

})();