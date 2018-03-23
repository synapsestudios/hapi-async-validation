const get = require('lodash.get');
const ValidationError = require('../ValidationError');

module.exports = bookshelf => (modelName, column, whereColumn, contextValuePath, message) => (value, options) => {
  var where = {};
  where[column] = value;
  var query = bookshelf.model(modelName).where(where);

  const contextValue = get(options.context, contextValuePath);
  if (typeof contextValue !== 'undefined') {
    query.where(whereColumn, '=', contextValue);
  }

  return query.fetch()
    .then(model => {
      if (! model) {
        return value;
      } else {
        throw new ValidationError(message || 'Row exists', 'rowNotExistsWhere');
      }
    })
};
