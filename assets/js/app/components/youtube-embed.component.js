(function () {
    'use strict';

    angular.module('components')
        .component('youtubeEmbed', {
            templateUrl: 'partials/youtube-embed.html',
            controller: youtubeEmbed,
            controllerAs: 'vm',
            bindings: {
                video: '@'
            }
        });

    youtubeEmbed.$inject = [
        '$sce'
    ];

    function youtubeEmbed($sce) {
        const vm = this;

        const params = {
            modestbranding: '1',
            rel: '0',
            showinfo: '0'
        };

        vm.$onInit = function () {
            vm.videoUrl = $sce.trustAsResourceUrl(addParams('https://www.youtube.com/embed/' + vm.video));
        };

        vm.$onDestroy = function () {
        };

        function addParams(url) {
            let newUrl = url + '?';

            for (let p in params)
                newUrl = newUrl + '&' + p + '=' + params[p];

            return newUrl;
        }

    }


})();