const Boom = require('boom');
const ValidationError = require('../ValidationError');

module.exports = Model => (modelName, column, message, constraintOptions) => (value, validatorOptions) => {
  const options = Object.assign(
    {
      convert: true,
      return404: true,
      fetchOptions: {},
    },
    validatorOptions || {},
    constraintOptions || {}
  );

  class Table extends Model {
    static get tableName() {
      return modelName;
    }
  }

  return Table.query()
    .where(column, '=', value)
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
        return rows;
      }
    });
};
