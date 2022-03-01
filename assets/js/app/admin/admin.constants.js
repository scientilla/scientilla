const phdModels = {
  INSTITUTE: 'institute',
  COURSE: 'course',
  CYCLE: 'cycle'
};

const phdActions = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete'
};

angular.module('app')
  .constant('phdModels', phdModels)
  .constant('phdActions', phdActions);
