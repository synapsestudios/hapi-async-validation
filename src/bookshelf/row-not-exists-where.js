const get = require('lodash/get');
const ValidationError = require('../ValidationError');

module.exports = (bookshelf) => {
  return (modelName, column, whereColumn, contextValuePath, message) => {
    return (value, options) => {
      return new Promise((resolve, reject) => {
        var Model = bookshelf.model(modelName);
        var where = {};

        where[column] = value;

        var query = Model.where(where);

        const contextValue = get(options.context, contextValuePath);
        if (typeof contextValue !== 'undefined') {
          query.where(whereColumn, '=', contextValue);
        }

        query.fetch()
          .then(model => {
            if (! model) {
              resolve(value);
            } else {
              reject(new ValidationError(message || 'Row exists', 'rowNotExistsWhere'));
            }
          }
          ).catch((err) => {
            reject(err);
          });
      });
    };
  };
};
