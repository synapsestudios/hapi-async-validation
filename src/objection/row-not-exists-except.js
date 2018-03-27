const get = require('lodash.get');
const ValidationError = require('../ValidationError');

module.exports = (Model, column, whereColumn, contextValuePath, message) => (value, options) => {
  var query = Model.query().where(column, '=', value);

  const contextValue = get(options.context, contextValuePath);
  if (typeof contextValue !== 'undefined') {
    query.where(whereColumn, '!=', contextValue);
  }

  return query.then(rows => {
    if (rows.length === 0) {
      return value;
    } else {
      throw new ValidationError(message || 'Row exists', 'rowNotExistsExcept');
    }
  });
};
