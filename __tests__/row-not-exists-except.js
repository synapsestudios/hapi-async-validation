const RowNotExistsExceptFactory = require('../src/bookshelf/row-not-exists-except');
const getMockBookshelf = require('../__mocks__/getMockBookshelf');
const mockOptions = require('../__mocks__/mockOptions');
mockOptions.context.params.id = 1;

test(`injecting bookshelf returns a function and doesn't crash`, () => {
  const RowNotExistsWhere = RowNotExistsExceptFactory(getMockBookshelf().bookshelf);
  expect(typeof RowNotExistsWhere).toBe('function');
});

test(`injecting bookshelf + validation options returns a function and doesn't crash`, () => {
  const RowNotExistsWhere = RowNotExistsExceptFactory(getMockBookshelf().bookshelf);
  expect(typeof RowNotExistsWhere('model-name', 'column', 'except-column', 'context-value-path', 'message')).toBe('function');
});

test(`bookshelf methods are called the expected number of times with the right args`, () => {
  const bookshelfMocks = getMockBookshelf(false);
  const RowNotExistsWhere = RowNotExistsExceptFactory(bookshelfMocks.bookshelf);

  expect.assertions(7);
  return RowNotExistsWhere('model-name', 'column', 'except-column', 'params.id', 'message')('value', mockOptions)
    .then(value => {
      const { model, where, fetch } = bookshelfMocks.functions;
      expect(model.mock.calls.length).toBe(1);
      expect(model.mock.calls[0][0]).toBe('model-name');

      expect(where.mock.calls.length).toBe(2);
      expect(where.mock.calls[0][0]).toEqual({column: 'value'});
      expect(where.mock.calls[1][0]).toBe('except-column');
      expect(where.mock.calls[1][2]).toBe(1);

      expect(fetch.mock.calls.length).toBe(1);
    });
});

test(`validation succeeds when the row doesn't exist`, () => {
  const bookshelfMocks = getMockBookshelf(false);
  const RowNotExistsWhere = RowNotExistsExceptFactory(bookshelfMocks.bookshelf);

  expect.assertions(1)
  return RowNotExistsWhere('model-name', 'column', 'except-column', 'params.id', 'message')('value', mockOptions)
    .then(value => {
      expect(value).toBe('value');
    });
});

test(`validation fails when the row exists and error is ValidationError`, () => {
  const bookshelfMocks = getMockBookshelf('return value');
  const RowNotExistsWhere = RowNotExistsExceptFactory(bookshelfMocks.bookshelf);

  expect.assertions(4);
  return RowNotExistsWhere('model-name', 'column', 'except-column', 'params.id', 'message')('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeFalsy();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('message');
      expect(error.type).toBe('rowNotExistsExcept');
    });
});
