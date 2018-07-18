const Boom = require('boom');

const getObjectionOptions = require('./get-objection-options');
const ValidationError = require('../ValidationError');

module.exports = (Model, column, message, constraintOptions) => async (value, validatorOptions) => {
  const options = getObjectionOptions(validatorOptions, constraintOptions);

  const rows = await Model.query()
    .where(column, '=', value)
    .eagerAlgorithm(Model[options.fetchOptions.eagerAlgorithm])
    .eagerOptions(options.fetchOptions.eagerOptions || {})
    .eager(options.fetchOptions.eager);

  if (!rows.length) {
    if (options.return404) {
      throw Boom.notFound(message || 'Row does not exist');
    } else {
      throw new ValidationError(message || 'Row does not exist', 'rowExists');
    }
  }

  return options.convert ? rows[0] : value;
};
