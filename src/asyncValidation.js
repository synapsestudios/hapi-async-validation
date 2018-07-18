const Joi = require('joi');
const Boom = require('boom');
const get = require('lodash/get');
const ValidationError = require('./ValidationError');

const callValidator = async (validator, values, path, options, error) => {
  try {
    const newValue = await validator(values[path], options);
    values[path] = newValue;
  } catch(err) {
    if (err.name !== 'ValidationError') {
      throw err;
    }

    error.details.push({
      path: [path],
      message: err.message,
      type: err.type,
      data: err.data,
    });

    if (options.abortEarly) {
      throw err;
    }
  }
};

// Mix JOI validation with our own custom validators
module.exports = (joiSchema, customSchema, overrides = {}) => {
  const validationFunction = async (values, options) => {
    const schema = Joi.object().keys(joiSchema);
    options.context.values = values;

    let { error } = await Joi.validate(values, schema, options);

    if (error) {
      error.details = error.details.map(details => {
        const { castJoiTo404 } = get(overrides, details.path, {});

        if (castJoiTo404) {
          throw Boom.notFound(castJoiTo404.message || 'Row does not exist');
        }

        return ({
          path: Array.isArray(details.path) ? details.path : details.path.split('.'),
          type: details.type,
          context: details.context,
        });
      });

      throw error;
    }

    error = new ValidationError('ValidationError');

    const promises = Object.keys(customSchema).reduce((accumulator, path) => {
      if (!values[path]) {
        return accumulator;
      }

      if (Array.isArray(customSchema[path])) {
        customSchema[path].forEach(validator => {
          accumulator.push(callValidator(validator, values, path, options, error));
        });
      } else {
        accumulator.push(callValidator(customSchema[path], values, path, options, error));
      }

      return accumulator;
    }, []);

    await Promise.all(promises);

    if (error.details.length) {
      throw error;
    }

    return values;
  };

  validationFunction.joiSchema = joiSchema;
  return validationFunction;
};
