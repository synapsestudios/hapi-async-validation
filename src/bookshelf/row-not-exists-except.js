var get = require('lodash/get');

module.exports = (bookshelf, ValidationError) => {
  return (modelName, column, exceptColumn, contextValuePath, message) => {
    return (value, options) => {
      return new Promise((resolve, reject) => {
        var Model = bookshelf.model(modelName);
        var where = {};

        where[column] = value;

        var query = Model.where(where);

        const contextValue = get(options.context, contextValuePath);
        if (typeof contextValue !== 'undefined') {
          query.where(exceptColumn, '!=', contextValue);
        }

        query.fetch()
          .then(model => {
            if (! model) {
              resolve(value);
            } else {
              reject(new ValidationError(message || 'Row exists', 'rowNotExistsExcept'));
            }
          }
          ).catch((err) => {
            reject(err);
          });
      });
    };
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf', 'validator/validation-error'];
