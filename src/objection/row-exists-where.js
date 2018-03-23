const Boom = require('boom');
const get = require('lodash.get');
const ValidationError = require('../ValidationError');

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

module.exports = Model => (modelName, column, whereArr, message, constraintOptions) =>
  function(value, validatorOptions) {
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
    const currentWhere = whereArr[0];
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
