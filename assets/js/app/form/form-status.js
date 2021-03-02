/* global angular */
(function () {
    angular.module('scientilla-form')
        .factory('FormStatus', function (){
            function FormStatus(mode) {
                this.mode = mode;
                this.resetFormInteraction = false;

                this.verifyState = 'ready to verify';
                this.verifyMessage = 'Save & verify';

                this.saveState = 'ready to save';
                this.saveMessage = 'Save draft';
            }

            FormStatus.prototype.setVerifyStatus = function (state) {
                this.verifyState = state;
                this.mode = 'verify';

                switch (state) {
                    case 'ready to verify':
                        this.verifyMessage = 'Save & verify';
                        break;
                    case 'verifying':
                        this.verifyMessage = 'Verifying draft';
                        break;
                    case 'verified':
                        this.verifyMessage = 'Draft is Verified!';
                        this.resetFormInteraction = true;
                        break;
                    case 'failed':
                        this.verifyMessage = 'Failed to verify!';
                        this.resetFormInteraction = true;
                        break;
                }
            };

            FormStatus.prototype.setSaveStatus =  function (state) {
                this.mode = 'draft';

                switch (state) {
                    case 'ready to save':
                        this.saveMessage = 'Save draft';
                        break;
                    case 'saving':
                        this.saveMessage = 'Saving draft';
                        break;
                    case 'saved':
                        this.saveMessage = 'Draft is saved!';
                        this.resetFormInteraction = true;
                        break;
                    case 'failed':
                        this.saveMessage = 'Failed to save draft!';
                        this.resetFormInteraction = true;
                        break;
                }
            };

            return FormStatus;
        });
})();