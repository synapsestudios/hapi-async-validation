const merge = require('lodash/merge');

module.exports = (validatorOptions, constraintOptions) => merge(
  {
    convert: true,
    return404: true,
    fetchOptions: { eager: '', eagerOptions: {}, eagerAlgorithm: 'WhereInEagerAlgorithm' },
  },
  validatorOptions || {},
  constraintOptions || {}
);
