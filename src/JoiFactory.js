const Joi = require('joi');

const extended = message =>
  Joi.extend(joi => ({
    name: 'ValidationError',
    language: {
      message: message,
    },
    pre(value, state, options) {
      return value;
    },
    rules: [
      {
        name: 'message',
        setup(params) {
          this._flags.round = true;
        },
        validate(params, value, state, options) {
          return this.createError('ValidationError.message', { v: value }, state, options);
        },
      },
    ],
  }));

module.exports = function JoiFactory(errorDetails) {
  const keysFromBadValues = {};
  const ErrorMessageSchema = {};
  errorDetails.forEach(detail => {
    keysFromBadValues[detail.path] = true; // An arbitrary value to get the key in the object.
    ErrorMessageSchema[detail.path] = extended(detail.message)
      .ValidationError()
      .message();
  });
  return Joi.validate(keysFromBadValues, ErrorMessageSchema, { abortEarly: false });
};
