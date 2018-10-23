(function () {
    "use strict";
    angular.module("services").factory("WizardService", WizardService);

    WizardService.$inject = [
        'context',
        'ModalService',
        '$rootScope',
        'Notification',
        'FormService'
    ];

    function WizardService(context, ModalService, $rootScope, Notification, FormService) {
        const service = {};

        service.featuresWizard = function() {
            let modal = {};
            let unsavedData = false;
            let user = context.getResearchEntity();
            let originalUser = angular.copy(user);

            let closing = function(event = false, reason = false) {

                unsavedData = FormService.getUnsavedData('scopus-edit');

                if (!modal.forceClose) {
                    if (unsavedData) {
                        if (event) {
                            event.preventDefault();
                        }

                        ModalService
                            .multipleChoiceConfirm('Unsaved data',
                                `Do you want to save this data?`,
                                ['Yes', 'No'],
                                false)
                            .then(function (buttonIndex) {
                                switch (buttonIndex) {
                                    case 0:
                                        user.save();
                                        originalUser = angular.copy(user);
                                        Notification.success('Profile saved!');
                                        FormService.setUnsavedData('scopus-edit', false);

                                        modal.forceClose = true;
                                        modal.close();
                                        break;
                                    case 1:
                                        user = angular.copy(originalUser);
                                        FormService.setUnsavedData('scopus-edit', false);
                                        $rootScope.$broadcast('user.scopus.discarded');

                                        modal.forceClose = true;
                                        modal.close();
                                        break;
                                    default:
                                        break;
                                }
                            });
                    } else {
                        modal.forceClose = true;
                        modal.close();
                    }
                }
            };

            modal = ModalService.openWizard([
                'welcome',
                'scopus-edit',
                'tutorial',
                'admin-tutorial',
            ], {
                isClosable: true,
                size: 'lg',
                callback: closing
            });
        };

        service.suggestedWizard = function() {
            let modal = {};
            let user = context.getResearchEntity();
            let originalUser = angular.copy(user);
            let unsavedData = false;

            let closing = function(event = false, reason = false) {

                unsavedData = FormService.getUnsavedData('alias-edit');

                if (!modal.forceClose) {
                    if (unsavedData) {
                        if (event) {
                            event.preventDefault();
                        }

                        ModalService
                            .multipleChoiceConfirm('Unsaved data',
                                `Do you want to save this data?`,
                                ['Yes', 'No'],
                                false)
                            .then(function (buttonIndex) {
                                switch(buttonIndex) {
                                    case 0:
                                        user.save();
                                        originalUser = angular.copy(user);
                                        Notification.success('Aliases saved!');
                                        FormService.setUnsavedData('alias-edit', false);

                                        if (typeof(user.aliases) === 'undefined' || user.aliases.length <= 0) {
                                            ModalService
                                                .multipleChoiceConfirm('Aliases',
                                                    `You should have a least one user alias`,
                                                    ['Ok'],
                                                    false);
                                        } else {
                                            modal.forceClose = true;
                                            modal.close();
                                        }
                                        break;
                                    case 1:
                                        user = angular.copy(originalUser);
                                        FormService.setUnsavedData('alias-edit', false);
                                        $rootScope.$broadcast('user.aliases.discarded');

                                        if (typeof(user.aliases) === 'undefined' || user.aliases.length <= 0) {
                                            ModalService
                                                .multipleChoiceConfirm('Aliases',
                                                    `You should have a least one user alias`,
                                                    ['Ok'],
                                                    false);
                                        } else {
                                            modal.forceClose = true;
                                            modal.close();
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            });
                    } else {
                        if (!user.aliases || user.aliases.length <= 0) {
                            if (event) {
                                event.preventDefault();
                            }

                            FormService.setUnsavedData('alias-edit', false);

                            ModalService
                                .multipleChoiceConfirm('Aliases',
                                    `You should have a least one user alias`,
                                    ['Ok'],
                                    false);
                        } else {
                            modal.forceClose = true;
                            modal.close();
                        }
                    }
                }
            };

            let options = {
                isClosable: true,
                size: 'lg',
                callback: closing
            };

            modal = ModalService.openWizard(['alias-edit'], options);

            modal.forceClose = false;
        };

        return service;
    }
}());