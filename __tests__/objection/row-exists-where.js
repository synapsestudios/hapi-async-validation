const RowExistsWhereFactory = require('../../src/objection/row-exists-where');
const getMockObjection= require('../../__mocks__/getMockObjection');
const mockOptions = require('../../__mocks__/mockOptions');
mockOptions.context.params.id = 1;

test(`injecting Model + validation options returns a function and doesn't crash`, () => {
  const Model = getMockObjection(['value']).Model;
  const RowExistsWhere = RowExistsWhereFactory(Model, 'column', 'where-column', 'context-value-path', 'message');
  expect(typeof RowExistsWhere).toBe('function');
});

test(`Model methods are called the expected number of times with the right args`, () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model
  const RowExistsWhere = RowExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });

  expect.assertions(11);
  return RowExistsWhere('value', mockOptions)
    .then(value => {
      const { Model, where, eager, eagerAlgorithm, eagerOptions } = mockObjection.functions;
      expect(where.mock.calls.length).toBe(2);
      expect(where.mock.calls[0][0]).toEqual('column');
      expect(where.mock.calls[0][1]).toEqual('=');
      expect(where.mock.calls[0][2]).toEqual('value');
      expect(where.mock.calls[1][0]).toBe('where-column');
      expect(where.mock.calls[1][2]).toBe(1);
      expect(eager.mock.calls.length).toBe(1);
      expect(eager.mock.calls[0][0]).toBe(('eagervalue'));
      expect(eagerAlgorithm.mock.calls.length).toBe(1);
      expect(eagerOptions.mock.calls.length).toBe(1);
      expect(eagerOptions.mock.calls[0][0]).toEqual({test: 'example'});

    });
});

test(`validation succeeds when the row exists`, () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model
  const RowExistsWhere = RowExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });

  expect.assertions(1)
  return RowExistsWhere('value', mockOptions)
    .then(value => {
      expect(value).toEqual(['value']);
    });
});

test(`validation fails when the row doesn't exist and default error is boom 404`, () => {
  const mockObjection = getMockObjection([]);
  const Model = mockObjection.Model
  const RowExistsWhere = RowExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });

  expect.assertions(2);
  return RowExistsWhere('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeTruthy();
      expect(error.output.statusCode).toBe(404);
    });
});

test(`error returned is a ValidationError when return404 is false`, () => {
  const mockObjection = getMockObjection([]);
  const Model = mockObjection.Model
  const RowExistsWhere = RowExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    return404: false,
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });

  expect.assertions(4);
  return RowExistsWhere('value', mockOptions)
    .catch(error => {
      expect(error.isBoom).toBeFalsy();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('message');
      expect(error.type).toBe('rowExists');
    });
});

test('value is untouched if convert option is false', () => {
  const mockObjection = getMockObjection(['value']);
  const Model = mockObjection.Model
  const RowExistsWhere = RowExistsWhereFactory(Model, 'column', 'where-column', 'params.id', 'message', {
    return404: false,
    convert: false,
    fetchOptions: {
      eager: 'eagervalue',
      eagerOptions: {test: 'example'}
    }
  });

  expect.assertions(1)
  return RowExistsWhere('value', mockOptions)
    .then(value => {
      expect(value).toEqual('value');
    });
});
