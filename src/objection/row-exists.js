const Boom = require('boom');
const ValidationError = require('../ValidationError');

module.exports = (Model, column, message, constraintOptions) => (value, validatorOptions) => {
  const options = Object.assign(
    {
      convert: true,
      return404: true,
      fetchOptions: { eager: '' },
    },
    validatorOptions || {},
    constraintOptions || {}
  );

  return Model.query()
    .where(column, '=', value)
    .eager(constraintOptions.fetchOptions.eager)
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
          return rows;
        } else {
          return value;
        }
      }
    });
};
