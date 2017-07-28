const Boom = require('boom');
const get = require('lodash/get');
const ValidationError = require('../ValidationError');

module.exports = bookshelf => {
  return (modelName, column, whereColumn, contextValuePath, message, constraintOptions) => {
    return (value, validatorOptions) => {
      const options = Object.assign(
        {
          convert: true,
          return404: true,
          fetchOptions: {},
        },
        validatorOptions || {},
        constraintOptions || {}
      );
      return new Promise((resolve, reject) => {
        const Model = bookshelf.model(modelName);
        const where = {};

        where[column] = value;

        const query = Model.where(where);

        const contextValue = get(options.context, contextValuePath);
        if (typeof contextValue !== 'undefined') {
          query.where(whereColumn, '=', contextValue);
        }

        query.fetch(options.fetchOptions)
          .then(model => {
            if (! model) {
              if (options.return404) {
                reject(Boom.notFound(message || 'Row does not exist'));
              } else {
                reject(new ValidationError(message || 'Row does not exist', 'rowExists'));
              }
            } else {
              resolve(options.convert ? model : value);
            }
          }
        ).catch((err) => {
          reject(err);
        });
      });
    };
  };
};
