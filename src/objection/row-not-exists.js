const ValidationError = require('../ValidationError');

module.exports = (Model, column, message, constraintOptions) => async (value, validatorOptions) => {
  const rows = await Model.query().where(column, '=', value);

  if (rows.length) {
    throw new ValidationError(message || 'Row exists', 'rowNotExists');
  }

  return value;
};
