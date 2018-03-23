const Boom = require('boom');
const get = require('lodash.get');
const ValidationError = require('../ValidationError');

module.exports = bookshelf => (modelName, column, whereColumn, contextValuePath, message, constraintOptions) => (value, validatorOptions) => {
  const options = Object.assign(
    {
      convert: true,
      return404: true,
      fetchOptions: {},
    },
    validatorOptions || {},
    constraintOptions || {}
  );

  const where = {};
  where[column] = value;
  const query = bookshelf.model(modelName).where(where);

  const contextValue = get(options.context, contextValuePath);
  if (typeof contextValue !== 'undefined') {
    query.where(whereColumn, '=', contextValue);
  }

  return query.fetch(options.fetchOptions)
    .then(model => {
      if (! model) {
        let throwable;
        if (options.return404) {
          throwable = Boom.notFound(message || 'Row does not exist');
        } else {
          throwable = new ValidationError(message || 'Row does not exist', 'rowExists');
        }
        throw throwable;
      } else {
        return options.convert ? model : value;
      }
    })
};
