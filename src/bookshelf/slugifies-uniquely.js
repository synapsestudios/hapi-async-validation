const get = require('lodash/get');
const slugify = require('../../slugify');

module.exports = (bookshelf, ValidationError) => {
  return (modelName, slugColumn, constraintOptions, message) => {
    return (value, validatorOptions) => {

      return new Promise((resolve, reject) => {
        const Model = bookshelf.model(modelName);
        const where = {};

        where[slugColumn] = slugify(value);

        if (constraintOptions.where) {
          const [whereColumn, contextValuePath] = constraintOptions.where;
          if (whereColumn && contextValuePath) {
            where[whereColumn] = get(validatorOptions.context, contextValuePath);
          }
        }

        let query = Model.where(where);

        if (constraintOptions.except) {
          const [exceptColumn, contextValuePath] = constraintOptions.except;
          const contextValue = get(validatorOptions.context, contextValuePath);
          if (typeof contextValue !== 'undefined') {
            query = query.where(exceptColumn, '!=', contextValue);
          }
        }

        query.fetch()
          .then(model => {
            if (model) {
              reject(
                new ValidationError(
                  message || 'Could not generate a unique slug from this value',
                  'doesNotSlugifyUniquely'
                )
              );
            } else {
              resolve(value);
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
