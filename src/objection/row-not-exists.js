const ValidationError = require('../ValidationError');

module.exports = (Model, column, message, constraintOptions) => (value, options) => {
  return Model.query()
    .where(column, '=', value)
    .then(function(rows) {
      if (rows.length === 0) {
        return value;
      } else {
        throw new ValidationError(message || 'Row exists', 'rowNotExists');
      }
    });
};
