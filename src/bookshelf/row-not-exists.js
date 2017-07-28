const ValidationError = require('../ValidationError');

module.exports = bookshelf => (modelName, column, message) => (value, options) => {
  const where = {};
  where[column] = value;

  return bookshelf.model(modelName).where(where).fetch()
    .then(model => {
      if (! model) {
        return value;
      } else {
        throw new ValidationError(message || 'Row exists', 'rowNotExists');
      }
    });
};
