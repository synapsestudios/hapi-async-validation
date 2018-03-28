const RowExistsFactory = require('../../src/objection/row-exists');
const getMockObjection= require('../../__mocks__/getMockObjection');
const mockOptions = require('../../__mocks__/mockOptions');

test(`injecting objection + validation options returns a function and doesn't crash`, () => {
  const Model = getMockObjection(['value']).Model;
  const RowExists = RowExistsFactory(Model, 'column', 'message', 'constraintOptions');
  expect(typeof RowExists).toBe('function');
});

test(`Model methods are called the expected number of times with the right args`, async () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model;
  const RowExists = RowExistsFactory(Model, 'column', 'message', {fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});

  const {query, where, eager, eagerAlgorithm, eagerOptions } = mockObjection.functions;
  expect.assertions(10);
  await RowExists(['value'], mockOptions)
  expect(query.mock.calls.length).toBe(1);
  expect(where.mock.calls.length).toBe(1);
  expect(where.mock.calls[0][0]).toEqual('column');
  expect(where.mock.calls[0][1]).toEqual('=');
  expect(where.mock.calls[0][2]).toEqual(['value']);
  expect(eager.mock.calls.length).toBe(1);
  expect(eager.mock.calls[0][0]).toEqual('eager');
  expect(eagerAlgorithm.mock.calls.length).toBe(1);
  expect(eagerOptions.mock.calls.length).toBe(1);
  expect(eagerOptions.mock.calls[0][0]).toEqual({option: 'example'});

});

test(`Result is returned when found`, async () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model;
  const RowExists = RowExistsFactory(Model, 'column', 'message', { convert: true, fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});

  const results = await RowExists('', mockOptions)
  expect.assertions(1)
  expect(results).toBe('value');
});

test(`validation fails when the row doesn't exist and default error is boom 404`, async () => {
  const mockObjection = getMockObjection([]);
  const Model = mockObjection.Model;
  const RowExists = RowExistsFactory(Model, 'column', 'message', { convert: true, fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});

  expect.assertions(2);
  await RowExists('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeTruthy();
      expect(error.output.statusCode).toBe(404);
    });
});

test(`error returned is a ValidationError when return404 is false`, async () => {
  const mockObjection = getMockObjection([]);
  const Model = mockObjection.Model;
  const RowExists = RowExistsFactory(Model, 'column', 'message', { return404: false, convert: true, fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});
  expect.assertions(4);
  await RowExists('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeFalsy();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('message');
      expect(error.type).toBe('rowExists');
    });
});

test('value is untouched if convert option is false', async () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model;
  const RowExists = RowExistsFactory(Model, 'column', 'message', { return404: false, convert: false , fetchOptions: {
    eagerOptions: {option: 'example'},
    eagerAlgorithm: 'myalgorithm',
    eager: 'eager',
  }});

  expect.assertions(1)
  return RowExists('value', mockOptions)
    .then(value => {
      expect(value).toBe('value');
    });
});
