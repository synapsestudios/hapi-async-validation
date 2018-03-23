const ValidationError = require('../ValidationError');

module.exports = Model => (modelName, column, message) => (value, options) => {

  class Table extends Model {
    static get tableName() {
      return modelName;
    }
  }

  return Table
    .query()
    .where(column, '=', value)
    .then(function(rows){
      if (rows.length === 0) {
        return value;
      } else {
        throw new ValidationError(message || 'Row exists', 'rowNotExists');
      }
    });
};
