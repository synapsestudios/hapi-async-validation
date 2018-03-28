const ValidationError = function(message, type, data) {
  this.name = 'ValidationError';
  this.message = message;
  this.stack = (new Error()).stack;
  this.type = type;

  if (data) {
    this.data = data;
  }
};

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.constructor = ValidationError;

module.exports = ValidationError;
