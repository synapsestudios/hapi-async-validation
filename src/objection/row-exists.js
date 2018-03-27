const Boom = require('boom');
const ValidationError = require('../ValidationError');
const merge = require('lodash/merge');

module.exports = (Model, column, message, constraintOptions) => (value, validatorOptions) => {
  // WhereInEagerAlgorithm is Objection's default.
  const options = merge(
    {
      convert: true,
      return404: true,
      fetchOptions: { eager: '', eagerOptions: {}, eagerAlgorithm: 'WhereInEagerAlgorithm' },
    },
    validatorOptions || {},
    constraintOptions || {}
  );

  return Model.query()
    .where(column, '=', value)
    .eagerAlgorithm(Model[options.fetchOptions.eagerAlgorithm])
    .eagerOptions(options.fetchOptions.eagerOptions || {})
    .eager(options.fetchOptions.eager)
    .then(function(rows) {
      if (rows.length === 0) {
        let throwable;
        if (options.return404) {
          throwable = Boom.notFound(message || 'Row does not exist');
        } else {
          throwable = new ValidationError(message || 'Row does not exist', 'rowExists');
        }
        throw throwable;
      } else {
        if (options.convert === true) {
          return rows[0];
        } else {
          return value;
        }
      }
    });
};
