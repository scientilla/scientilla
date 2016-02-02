(function () {
    angular
            .module('references')
            .directive('scientillaDocumentForm', scientillaDocumentForm);

    function scientillaDocumentForm() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDocumentForm.html',
            controller: scientillaDocumentFormController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                document: "=",
                researchEntity: "=",
                onCancel: "&",
                onSubmit: "&"
            }
        };
    }

    scientillaDocumentFormController.$inject = [
        'FormForConfiguration',
        'Restangular',
        '$scope',
        '$route',
        '$location',
        '$q'
    ];

    function scientillaDocumentFormController(FormForConfiguration, Restangular, $scope, $route, $location, $q) {
        var vm = this;
        if (!vm.document)
            vm.document = vm.researchEntity.getNewDocument();
        vm.submit = submit;
        vm.status = 'saved';
        vm.cancel = cancel;

        vm.validationAndViewRules = {
            title: {
                inputType: 'text'
            },
            authors: {
                inputType: 'text'
            }
        };

        activate();


        function activate() {
            FormForConfiguration.enableAutoLabels();

            watchReference();
//            getReference().then(function () {
//                watchReference();
//            });

        }

        function watchReference() {
            var fieldsToWatch = _.keys(vm.validationAndViewRules);
            _.forEach(fieldsToWatch, function (f) {
                $scope.$watch('vm.document.' + f, markModified, true);
                $scope.$watch('vm.document.' + f, _.debounce(saveReference, 3000), true);
            });
        };

        function markModified(newValue, oldValue) {
            if (newValue === oldValue)
                return;
            vm.status = 'unsaved';
        }

        function saveReference() {
            if (vm.status === 'saved')
                return $q(function (resolve) { resolve(vm.document);});
            return vm.document.save().then(function () {
                vm.status = 'saved';
            });
        }

        function getReference() {

            var referenceId = $route.current.params.id;

            return Restangular
                    .one('references', referenceId)
                    .get({populate: ['draftCreator', 'draftGroupCreator']})
                    .then(function (reference) {
                        vm.document = reference;
                        return vm.document;
                    });
        }

        function submit() {
            saveReference().then(function () {
                vm.onSubmit()();
            });
        
        }
        
        function cancel() {
            vm.onCancel()();
        }

        //sTODO: refactor
        function goToBrowsing() {
            var url = vm.document.getDraftCreator().getReferenceBrowsingUrl();
            $location.path(url);
        }

    }
})();