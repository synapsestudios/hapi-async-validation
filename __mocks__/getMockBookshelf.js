module.exports = (returnValue) => {
  const bookshelf = {};
  const model = jest.fn(() => bookshelf);
  const where = jest.fn(() => bookshelf);
  const fetch = jest.fn(() => Promise.resolve(returnValue));
  const fetchAll = jest.fn(() => Promise.resolve(returnValue));

  bookshelf.model = model;
  bookshelf.where = where;
  bookshelf.fetch = fetch;
  bookshelf.fetchAll = fetchAll;

  return {
    bookshelf,
    functions : { model, where, fetch, fetchAll },
  };
}
