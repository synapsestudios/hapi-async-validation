const Boom = require('@hapi/boom');
const get = require('lodash/get');

const getObjectionOptions = require('./get-objection-options');
const ValidationError = require('../ValidationError');

module.exports = (Model, column, whereColumn, contextValuePath, message, constraintOptions) =>
  async (value, validatorOptions) => {
    const options = getObjectionOptions(validatorOptions, constraintOptions);
    const contextValue = get(options.context, contextValuePath);
    const query = Model.query().where(column, '=', value);

    if (typeof contextValue !== 'undefined') {
      query.where(whereColumn, '=', contextValue);
    }

    const rows = await query
      .eagerAlgorithm(Model[options.fetchOptions.eagerAlgorithm])
      .eagerOptions(options.fetchOptions.eagerOptions)
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
