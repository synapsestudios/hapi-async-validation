// TODO use actual models that have relations working
const Boom = require('boom');
const get = require('lodash.get');
const ValidationError = require('../ValidationError');

function mapContextValues(whereArray, validatorOptions) {
  return whereArray.map(function(whereClause, index) {
    if (whereClause[2].slice(0, 3) !== 'cv:') {
      return whereClause;
    } else {
      const contextValuePath = whereClause[2].slice(3);
      const contextValueToMap = get(validatorOptions.context, contextValuePath);
      if (contextValueToMap === undefined) {
        throw new Error('Context Value is undefined');
      }
      whereClause[2] = contextValueToMap;
      return whereClause;
    }
  });
}

function whereBuilder(validatedValue, whereArray, objectionModel) {
  if (whereArray.length < 2) {
    objectionModel.where(whereArray[0][0], whereArray[0][1], whereArray[0][2] || validatedValue);
  } else {
    whereArray.forEach(function(item, index) {
      if (item.length === 3) {
        objectionModel.andWhere(item[0], item[1], item[2]);
      } else if (item.length === 2) {
        objectionModel.andWhere(item[0], item[1], validatedValue);
      } else {
        throw new Error('Where clause must have at least 2 or 3 values. Please refer to the documentation.');
      }
    });
  }
  return objectionModel;
}

module.exports = Model => (modelName, column, whereArr, message, constraintOptions, contextValuePath) =>
  function(value, validatorOptions) {
    mapContextValues(whereArr, validatorOptions);
    const options = Object.assign(
      {
        convert: true,
        return404: false,
        fetchOptions: {},
      },
      validatorOptions || {},
      constraintOptions || {}
    );

    class Table extends Model {
      static get tableName() {
        return modelName;
      }
    }
    return whereBuilder(value, whereArr, Table.query()).then(function(rows) {
      if (rows.length === 0) {
        let throwable;
        if (options.return404) {
          throwable = Boom.notFound(message || 'Row does not exist');
        } else {
          throwable = new ValidationError(message || 'Row does not exist', 'rowExists');
        }
        throw throwable;
      } else {
        return options.convert ? rows : value;
      }
    });
  };
