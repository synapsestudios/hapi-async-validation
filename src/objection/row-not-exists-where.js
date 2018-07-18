const get = require('lodash/get');

const ValidationError = require('../ValidationError');

module.exports = (Model, column, whereColumn, contextValuePath, message) => async (value, validatorOptions) => {
  const contextValue = get(validatorOptions.context, contextValuePath);
  const query = Model.query().where(column, '=', value);

  if (typeof contextValue !== 'undefined') {
    query.where(whereColumn, '=', contextValue);
  }

  const rows = await query;

  if (rows.length) {
    throw new ValidationError(message || 'Row exists', 'rowNotExistsWhere');
  }

  return value;
};
