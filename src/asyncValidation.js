const Joi = require('joi');

const callValidator = (validator, values, path, options, errors) => {
  return validator(values[path], options)
    .then(newValue => {
      values[path] = newValue;
    })
    .catch(err => {
      if (err.name !== 'ValidationError') {
        // A real error happened
        return values;
      }

      errors.details.push({
        path: path,
        message: err.message,
        type: err.type,
        data: err.data,
      });

      if (options.abortEarly) {
        return err;
      }
    });
};

// Mix JOI validation with our own custom validators
const asyncValidation = (joiSchema, customSchema) => {
  const validationFunction = async (values, options) => {
    // return values;
    const schema = Joi.object().keys(joiSchema);
    options.context.values = values;

    const validated = Joi.validate(values, schema, options);

    if (validated.errors) {
      return validated;
    }

    const query = await customSchema.user_id(values.user_id);
    if (query.length === 0) {
      throw new Error('Not found');
    }
    return validated;
    return Joi.validate(values, schema, options, (errors, values) => {
      if (errors && options.abortEarly) {
        return errors;
      } else if (!errors) {
        errors = new Error();
        errors.details = [];
      }

      const promises = Object.keys(customSchema).reduce((accumulator, path) => {
        if (!values[path]) {
          return accumulator;
        }

        if (Array.isArray(customSchema[path])) {
          customSchema[path].forEach(validator => {
            accumulator.push(callValidator(validator, values, path, options, errors));
          });
        } else {
          accumulator.push(callValidator(customSchema[path], values, path, options, errors));
        }
        return accumulator;
      }, []);

      const all = Promise.all(promises)
        .then(() => {
          if (errors.details.length) {
            return errors;
          } else {
            return values;
          }
        })
        .catch(err => {
          return err;
        });
    });
  };

  validationFunction.joiSchema = joiSchema;
  return validationFunction;
};

async function testValidation() {
  return new Error('fake err');
}

module.exports = asyncValidation;
