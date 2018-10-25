/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAffiliationsForm', {
            templateUrl: 'partials/scientilla-document-affiliations-form.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                onFailure: "&",
                onSubmit: "&"
            }
        });


    controller.$inject = [
        '$scope',
        'Restangular',
        'ModalService'
    ];

    function controller($scope, Restangular, ModalService) {
        const vm = this;
        vm.getInstitutesFilter = getInstitutesFilter;
        vm.getInstitutesQuery = getInstitutesQuery;
        vm.submit = submit;
        vm.cancel = cancel;

        let originalAffiliations = [];

        vm.$onInit = () => {
            $scope.$watch('vm.position', userSelectedChanged);
            $scope.$watch('vm.authorship.affiliations', resetInstitutes, true);

            // Listen to modal closing event
            $scope.$on('modal.closing', function(event, reason) {
                cancel(event, reason);
            });
        };

        function getInstitutesQuery(searchText) {
            const qs = {where: {name: {contains: searchText}, parentId: null}};
            const model = 'institutes';
            return {model: model, qs: qs};
        }

        function resetInstitutes() {
            vm.document.institutes = _.uniqBy(_.flatMap(vm.document.authorships, 'affiliations'), 'id');
        }

        function userSelectedChanged() {

            if (_.isUndefined(vm.position)) {
                return;
            }

            vm.author = vm.document.getAuthors()[vm.position];
            vm.authorship = vm.document.authorships.find(a => a.position === vm.position);
            if (!vm.authorship) {
                const newAuthorship = {
                    document: vm.document.id,
                    position: vm.position,
                    affiliations: []
                };
                vm.document.authorships.push(newAuthorship);
                vm.authorship = newAuthorship;
            }

            getAuthorInstitutes()
                .then((institutes) => {
                    vm.authorship.affiliations = institutes;
                    // Copy original affiliations to compare it later
                    originalAffiliations = angular.copy(institutes);
                });
        }

        function getAuthorInstitutes() {
            if (_.isNil(vm.position))
                return Promise.resolve([]);
            const qs = {
                where: {document: vm.document.id, position: vm.position},
                populate: 'affiliations'
            };
            return Restangular.all('authorships').getList(qs).then(function (authorships) {
                if (_.isEmpty(authorships))
                    return [];
                return authorships[0].affiliations;
            });
        }

        function getInstitutesFilter() {
            return vm.authorship.affiliations;
        }

        function cancel(event = false) {
            // Check if an position/author is selected or the authorshop is set
            if (_.isUndefined(vm.position) || _.isUndefined(vm.authorship)) {
                executeOnSubmit(0);
            } else {
                // Compare the current state with the original state of the affiliations
                if (angular.toJson(vm.authorship.affiliations) === angular.toJson(originalAffiliations)) {
                    executeOnSubmit(0);
                } else {
                    if (event) {
                        // Prevent modal from closing
                        event.preventDefault();
                    }

                    // Show the unsaved data modal
                    ModalService
                        .multipleChoiceConfirm('Unsaved data',
                            `There is unsaved data in the form. Do you want to go back and save this data?`,
                            ['Yes', 'No'],
                            false)
                        .then(function (buttonIndex) {
                            switch (buttonIndex) {
                                case 0:
                                    break;
                                case 1:
                                    vm.authorship.affiliations = angular.copy(originalAffiliations);
                                    executeOnSubmit(0);
                                    break;
                                default:
                                    break;
                            }
                        });
                }
            }
        }

        function submit() {
            return save()
                .then(function (user) {
                    // Copy the new affiliations to the originalAffiliations variable
                    originalAffiliations = angular.copy(vm.authorship.affiliations);
                    executeOnSubmit(1);
                })
                .catch(function () {
                    executeOnFailure();
                });
        }

        function save() {
            return vm.document.customPUT(vm.document.authorships, 'authorships');
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit())) {
                vm.onSubmit()(i);
            }
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure())) {
                vm.onFailure()();
            }
        }
    }
})();
