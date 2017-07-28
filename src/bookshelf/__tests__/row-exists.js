const RowExistsFactory = require('../row-exists');

const mockOptions = {
  context: {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      host: 'localhost:9000',
      connection: 'close',
      'user-agent': 'Paw/3.1.2 (Macintosh; OS X/10.12.5) GCDHTTPRequest',
      'content-length': '15'
    },
    params: {},
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
  const RowExists = RowExistsFactory(getMockBookshelf().bookshelf);
  expect(typeof RowExists).toBe('function');
});

test(`injecting bookshelf + validation options returns a function and doesn't crash`);

test(`bookshelf methods are called the expected number of times with the right args`, () => {
  const bookshelfMocks = getMockBookshelf('return value');
  const RowExists = RowExistsFactory(bookshelfMocks.bookshelf);
  return RowExists('model-name', 'column', 'message')('value', mockOptions)
    .then(value => {
      const { model, where, fetch } = bookshelfMocks.functions;
      expect(model.mock.calls.length).toBe(1);
      expect(model.mock.calls[0][0]).toBe('model-name');

      expect(where.mock.calls.length).toBe(1);
      expect(where.mock.calls[0][0]).toEqual({column: 'value'});

      expect(fetch.mock.calls.length).toBe(1);
    });
});

test(`validation succeeds when the row exists`, () => {
  const bookshelfMocks = getMockBookshelf('return value');
  const RowExists = RowExistsFactory(bookshelfMocks.bookshelf);
  return RowExists('model-name', 'column', 'message')('value', mockOptions)
    .then(value => {
      expect(value).toBe('return value');
    });
});

test(`validation fails when the row doesn't exist`);
test(`error returned is a 404 when return404 is true`);
test('value is untouched if convert option is false');
