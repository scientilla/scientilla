(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminPhdThesis', {
            templateUrl: 'partials/scientilla-admin-phd-thesis.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'Restangular',
        'ModalService',
        'phdActions',
        'phdModels',
        'EventsService',
        'Notification',
        'PhdThesisService'
    ];

    function controller(
        Restangular,
        ModalService,
        phdActions,
        phdModels,
        EventsService,
        Notification,
        PhdThesisService
    ) {
        const vm = this;

        vm.actions = phdActions;
        vm.models = phdModels;

        vm.institutes = [];
        vm.selectedInstitute = false;
        vm.courses = [];
        vm.selectedCourse = false;
        vm.cycles = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            EventsService.subscribeAll(vm, [
                EventsService.PHD_INSTITUTE_CREATED,
                EventsService.PHD_INSTITUTE_UPDATED,
                EventsService.PHD_INSTITUTE_DELETED
            ], async () => {
                vm.institutes = await PhdThesisService.getInstitutes();
            });

            EventsService.subscribeAll(vm , [
                EventsService.PHD_COURSE_CREATED,
                EventsService.PHD_COURSE_UPDATED,
                EventsService.PHD_COURSE_DELETED
            ], async () => {
                vm.courses = await PhdThesisService.getCourses(vm.selectedInstitute);
            });

            EventsService.subscribeAll(vm , [
                EventsService.PHD_CYCLE_CREATED,
                EventsService.PHD_CYCLE_UPDATED,
                EventsService.PHD_CYCLE_DELETED
            ], async () => {
                vm.cycles = await PhdThesisService.getCycles(vm.selectedCourse);
            });

            vm.selectedInstitute = false;
            vm.selectedCourse = false;
            vm.institutes = await PhdThesisService.getInstitutes();
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        vm.openModal = (type, action, institute, course = false, cycle = false) => {
            ModalService.openAdminPhdThesisForm(type, action, institute, course, cycle);
        };

         /* jshint ignore:start */
        vm.delete = async (type, item) => {
            let result = false;
            let message = false;

            try {
                switch (type) {
                    case vm.models.INSTITUTE:
                        result = await Restangular.one('phdInstitutes', item.id).remove();
                        if (vm.selectedInstitute.id === item.id) {
                            vm.selectedInstitute = false;
                        }
                        EventsService.publish(EventsService.PHD_INSTITUTE_DELETED);
                        message = 'Institute successfully deleted!';
                        break;
                    case vm.models.COURSE:
                        result = await Restangular.one('phdCourses', item.id).remove();
                        if (vm.selectedCourse.id === item.id) {
                            vm.selectedCourse = false;
                        }
                        EventsService.publish(EventsService.PHD_COURSE_DELETED);
                        message = 'Course successfully deleted!';
                        break;
                    case vm.models.CYCLE:
                        result = await Restangular.one('phdCycles', item.id).remove();
                        EventsService.publish(EventsService.PHD_CYCLE_DELETED);
                        message = 'Cycle successfully deleted!';
                        break;
                    default:
                        break;
                }
            } catch(e) {
                message = 'Something went wrong, please try again!';

                if (_.has(e, 'data.message') && e.data.message.indexOf('violates foreign key constraint')) {
                    switch (type) {
                        case vm.models.INSTITUTE:
                            message = 'Cannot delete this institute because there are connected courses and/or cycles!';
                            break;
                        case vm.models.COURSE:
                            message = 'Cannot delete this course because there are connected cycles!';
                            break;
                        default:
                            break;
                    }
                }

                Notification.error(message);
            }

            if (result && message) {
                Notification.success(message);
            }
        };

        vm.selectInstitute = async institute => {
            vm.selectedInstitute = institute;
            vm.selectedCourse = false;
            vm.courses = await PhdThesisService.getCourses(institute);
        };

        vm.selectCourse = async course => {
            vm.selectedCourse = course;
            vm.cycles = await PhdThesisService.getCycles(course);
        };
        /* jshint ignore:end */
    }

})();
