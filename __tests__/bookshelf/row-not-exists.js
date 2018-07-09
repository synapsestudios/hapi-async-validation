const RowNotExistsFactoryy = require('../../src/bookshelf/row-not-exists');
const getMockBookshelf = require('../../__mocks__/getMockBookshelf');
const mockOptions = require('../../__mocks__/mockOptions');

test(`injecting bookshelf returns a function and doesn't crash`, () => {
  const RowNotExists = RowNotExistsFactoryy(getMockBookshelf().bookshelf);
  expect(typeof RowNotExists).toBe('function');
});

test(`injecting bookshelf + validation options returns a function and doesn't crash`, () => {
  const RowNotExists = RowNotExistsFactoryy(getMockBookshelf().bookshelf);
  expect(typeof RowNotExists('model-name', 'column', 'message')).toBe('function');
});

test(`bookshelf methods are called the expected number of times with the right args`, () => {
  const bookshelfMocks = getMockBookshelf(false);
  const RowNotExists = RowNotExistsFactoryy(bookshelfMocks.bookshelf);

  expect.assertions(5);
  return RowNotExists('model-name', 'column', 'message')('value', mockOptions)
    .then(value => {
      const { model, where, fetch } = bookshelfMocks.functions;
      expect(model.mock.calls.length).toBe(1);
      expect(model.mock.calls[0][0]).toBe('model-name');

      expect(where.mock.calls.length).toBe(1);
      expect(where.mock.calls[0][0]).toEqual({column: 'value'});

      expect(fetch.mock.calls.length).toBe(1);
    });
});

test(`validation succeeds when the row doesn't exists`, () => {
  const bookshelfMocks = getMockBookshelf(false);
  const RowNotExists = RowNotExistsFactoryy(bookshelfMocks.bookshelf);

  expect.assertions(1)
  return RowNotExists('model-name', 'column', 'message')('value', mockOptions)
    .then(value => {
      expect(value).toBe('value');
    });
});

test(`validation fails when the row exists and error returned is a ValidationError`, () => {
  const bookshelfMocks = getMockBookshelf('return value');
  const RowNotExists = RowNotExistsFactoryy(bookshelfMocks.bookshelf);

  expect.assertions(4);
  return RowNotExists('model-name', 'column', 'message')('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeFalsy();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('message');
      expect(error.type).toBe('rowNotExists');
    });
});
