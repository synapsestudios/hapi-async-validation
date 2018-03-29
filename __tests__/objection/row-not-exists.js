const RowNotExistsFactory = require('../../src/objection/row-not-exists');
const getMockObjection= require('../../__mocks__/getMockObjection');
const mockOptions = require('../../__mocks__/mockOptions');

test(`injecting Model returns a function and doesn't crash`, () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model;
  const RowNotExists = RowNotExistsFactory(Model, 'column', 'message', {fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});
  expect(typeof RowNotExists).toBe('function');
});

test(`injecting Model + validation options returns a function and doesn't crash`, () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model;
  const RowNotExists = RowNotExistsFactory(Model, 'column', 'message', {fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});
  expect(typeof RowNotExists).toBe('function');
});

test(`Model methods are called the expected number of times with the right args`, () => {
  const mockObjection = getMockObjection([]);
  const Model = mockObjection.Model;
  const RowNotExists = RowNotExistsFactory(Model, 'column', 'message', {fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});

  expect.assertions(5);
  return RowNotExists('value', mockOptions)
    .then(value => {
      const { query, model, where, eager, eagerAlgorithm, eagerOptions } = mockObjection.functions;
      expect(query.mock.calls.length).toBe(1);
      expect(where.mock.calls.length).toBe(1);
      expect(where.mock.calls[0][0]).toEqual('column');
      expect(where.mock.calls[0][1]).toEqual('=');
      expect(where.mock.calls[0][2]).toEqual('value');

    });
});

test(`validation succeeds when the row doesn't exist`, () => {
  const mockObjection = getMockObjection([]);
  const Model = mockObjection.Model;
  const RowNotExists = RowNotExistsFactory(Model, 'column', 'message', {fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});

  expect.assertions(1)
  return RowNotExists('value', mockOptions)
    .then(value => {
      expect(value).toBe('value');
    });
});

test(`validation fails when the row exists and error returned is a ValidationError`, () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model;
  const RowNotExists = RowNotExistsFactory(Model, 'column', 'message', {fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});

  expect.assertions(4);
  return RowNotExists('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeFalsy();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('message');
      expect(error.type).toBe('rowNotExists');
    });
});
