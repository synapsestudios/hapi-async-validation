module.exports = (bookshelf, ValidationError) => {
  return (modelName, column, message) => {
    return (value, options) => {
      return new Promise((resolve, reject) => {
        const Model = bookshelf.model(modelName);
        const where = {};

        where[column] = value;

        const query = Model.where(where);

        query.fetch()
          .then(model => {
            if (! model) {
              resolve(value);
            } else {
              reject(new ValidationError(message || 'Row exists', 'rowNotExists'));
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
