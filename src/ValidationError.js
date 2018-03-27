const Joi = require('joi');

const ValidationError = function(message, type, data) {
  this.name = 'ValidationError';
  this.message = message;
  this.stack = new Error().stack;
  this.type = type;

  if (data) {
    this.data = data;
  }
};

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.constructor = ValidationError;
ValidationError.JoiFactory = function(errorDetails) {
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

module.exports = ValidationError;

const extended = message =>
  Joi.extend(joi => ({
    name: 'ValidationError',
    language: {
      message: 'Validation Error',
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
          if (true) {
            return this.createError('ValidationError.message', { v: value }, state, options);
          }
          return value; //Everything is okay
        },
      },
    ],
  }));
