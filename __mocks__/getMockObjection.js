module.exports = (returnValue) => {
  const objection = {};
  const Model = {}//jest.fn(() => Model);
  const qb = Promise.resolve(returnValue)//new Promise((resolve) => {
    // resolve(returnValue);
  // });
  const query = jest.fn(() => Promise.resolve(qb));
  const where = jest.fn(() => Promise.resolve(qb));
  const eagerAlgorithm = jest.fn(() => Promise.resolve(qb));
  const eagerOptions = jest.fn(() => Promise.resolve(qb));
  const eager = jest.fn(() => Promise.resolve(qb));

  qb.where = where;
  qb.eagerAlgorithm = eagerAlgorithm;
  qb.eagerOptions = eagerOptions;
  qb.eager = eager;
  Model.query = query;

  return {
    Model: Model,
    functions : { Model, query: Model.query, where, eagerAlgorithm, eagerOptions, eager },
  };
}
