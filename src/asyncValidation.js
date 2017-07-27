const Joi = require('joi');

const callValidator = (validator, values, path, options, errors, next) => {
  return validator(values[path], options)
    .then(newValue => {
      values[path] = newValue;
    })
    .catch(err => {
      if (err.name !== 'ValidationError') { // A real error happened
        return next(err, values);
      }

      errors.details.push({
        path: path,
        message: err.message,
        type: err.type,
        data: err.data,
      });

      if (options.abortEarly) {
        next(err, values);
      }
    });
}

// Mix JOI validation with our own custom validators
module.exports = (joiSchema, customSchema) => {
  const validationFunction = (values, options, next) => {
    const schema = Joi.object().keys(joiSchema);
    options.context.values = values;

    return Joi.validate(values, schema, options, (errors, values) => {
      if (errors && options.abortEarly) {
        next(errors, values);
      } else if (! errors) {
        errors = new Error();
        errors.details = [];
      }

      const promises = Object.keys(customSchema).reduce((accumulator, path) => {
        if (! values[path]) {
          return accumulator;
        }

        if (Array.isArray(customSchema[path])) {
          customSchema[path].forEach(validator => {
            accumulator.push(callValidator(validator, values, path, options, errors, next))
          });
        } else {
          accumulator.push(callValidator(customSchema[path], values, path, options, errors, next));
        }
        return accumulator;
      }, []);

      return Promise.all(promises)
        .then(() => {
          if (errors.details.length) {
            next(errors, values);
          } else {
            next(null, values);
          }
        })
        .catch((err) => {
          next(err, values);
        });
    });
  };

  validationFunction.joiSchema = joiSchema;
  return validationFunction;
};
