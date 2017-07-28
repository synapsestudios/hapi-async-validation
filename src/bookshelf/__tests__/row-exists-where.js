const RowExistsWhereWhereFactory = require('../row-exists-where');

const mockOptions = {
  context: {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      host: 'localhost:9000',
      connection: 'close',
      'user-agent': 'Paw/3.1.2 (Macintosh; OS X/10.12.5) GCDHTTPRequest',
      'content-length': '15'
    },
    params: {
      id: 1
    },
    query: {},
    auth: {
      isAuthenticated: false,
      credentials: null,
      artifacts: null,
      strategy: null,
      mode: null,
      error: null
    },
    app: {
      route: {},
      request: {}
    }
  }
}

const getMockBookshelf = (returnValue) => {
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

test(`injecting bookshelf returns a function and doesn't crash`, () => {
  const RowExistsWhere = RowExistsWhereWhereFactory(getMockBookshelf().bookshelf);
  expect(typeof RowExistsWhere).toBe('function');
});

test(`injecting bookshelf + validation options returns a function and doesn't crash`, () => {
  const RowExistsWhere = RowExistsWhereWhereFactory(getMockBookshelf().bookshelf);
  expect(typeof RowExistsWhere('model-name', 'column', 'where-column', 'context-value-path', 'message')).toBe('function');
});

test(`bookshelf methods are called the expected number of times with the right args`, () => {
  const bookshelfMocks = getMockBookshelf('return value');
  const RowExistsWhere = RowExistsWhereWhereFactory(bookshelfMocks.bookshelf);

  expect.assertions(7);
  return RowExistsWhere('model-name', 'column', 'where-column', 'params.id', 'message')('value', mockOptions)
    .then(value => {
      const { model, where, fetch } = bookshelfMocks.functions;
      expect(model.mock.calls.length).toBe(1);
      expect(model.mock.calls[0][0]).toBe('model-name');

      expect(where.mock.calls.length).toBe(2);
      expect(where.mock.calls[0][0]).toEqual({column: 'value'});
      expect(where.mock.calls[1][0]).toBe('where-column');
      expect(where.mock.calls[1][2]).toBe(1);

      expect(fetch.mock.calls.length).toBe(1);
    });
});

test(`validation succeeds when the row exists`, () => {
  const bookshelfMocks = getMockBookshelf('return value');
  const RowExistsWhere = RowExistsWhereWhereFactory(bookshelfMocks.bookshelf);

  expect.assertions(1)
  return RowExistsWhere('model-name', 'column', 'where-column', 'params.id', 'message')('value', mockOptions)
    .then(value => {
      expect(value).toBe('return value');
    });
});

test(`validation fails when the row doesn't exist and default error is boom 404`, () => {
  const bookshelfMocks = getMockBookshelf(false);
  const RowExistsWhere = RowExistsWhereWhereFactory(bookshelfMocks.bookshelf);

  expect.assertions(2);
  return RowExistsWhere('model-name', 'column', 'where-column', 'params.id', 'message')('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeTruthy();
      expect(error.output.statusCode).toBe(404);
    });
});

test(`error returned is a ValidationError when return404 is false`, () => {
  const bookshelfMocks = getMockBookshelf(false);
  const RowExistsWhere = RowExistsWhereWhereFactory(bookshelfMocks.bookshelf);

  expect.assertions(4);
  return RowExistsWhere('model-name', 'column', 'where-column', 'params.id', 'message', { return404: false })('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeFalsy();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('message');
      expect(error.type).toBe('rowExists');
    });
});

test('value is untouched if convert option is false', () => {
  const bookshelfMocks = getMockBookshelf('return value');
  const RowExistsWhere = RowExistsWhereWhereFactory(bookshelfMocks.bookshelf);

  expect.assertions(1)
  return RowExistsWhere('model-name', 'column', 'where-column', 'params.id', 'message', { convert: false })('value', mockOptions)
    .then(value => {
      expect(value).toBe('value');
    });
});