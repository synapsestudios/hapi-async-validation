const RowNotExistsWhereFactory = require('../../src/objection/row-not-exists-where');
const getMockObjection= require('../../__mocks__/getMockObjection');
const mockOptions = require('../../__mocks__/mockOptions');
mockOptions.context.params.id = 1;

test(`injecting Model + validation options returns a function and doesn't crash`, () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model
  const RowNotExistsWhere = RowNotExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });
  expect(typeof RowNotExistsWhere).toBe('function');
});

test(`Model methods are called the expected number of times with the right args`, () => {
  const mockObjection = getMockObjection([]);
  const Model = mockObjection.Model
  const RowNotExistsWhere = RowNotExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });

  expect.assertions(7);
  return RowNotExistsWhere('value', mockOptions)
    .then(value => {
      const { Model, query, where, eager, eagerAlgorithm, eagerOptions } = mockObjection.functions;
      expect(query.mock.calls.length).toBe(1);
      expect(where.mock.calls.length).toBe(2);
      expect(where.mock.calls[0][0]).toEqual('column');
      expect(where.mock.calls[0][1]).toEqual('=');
      expect(where.mock.calls[0][2]).toEqual('value');
      expect(where.mock.calls[1][0]).toBe('where-column');
      expect(where.mock.calls[1][2]).toBe(1);


    });
});

test(`validation succeeds when the row doesn't exist`, () => {
  const mockObjection = getMockObjection([]);
  const Model = mockObjection.Model
  const RowNotExistsWhere = RowNotExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });

  expect.assertions(1)
  return RowNotExistsWhere('value', mockOptions)
    .then(value => {
      expect(value).toBe('value');
    });
});

test(`validation fails when the row exists and error is ValidationError`, () => {
  const mockObjection = getMockObjection(['A value']);
  const Model = mockObjection.Model
  const RowNotExistsWhere = RowNotExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });


  expect.assertions(4);
  return RowNotExistsWhere('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeFalsy();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('message');
      expect(error.type).toBe('rowNotExistsWhere');
    });
});
