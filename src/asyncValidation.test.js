const asyncValidation = require('./asyncValidation');
const Joi = require('joi');
const ValidationError = require('./ValidationError');

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

test(`returns a function and doesn't crash`, () => {
  const validator = asyncValidation();
  expect(typeof validator).toBe('function');
});

test('calls next with errors when joi schema fails', () => {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: (value, options) => Promise.resolve(123),
  });

  const next = jest.fn();
  expect.assertions(3);
  return validator({string: 123}, mockOptions, next)
    .then(() => {
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0]).toBeTruthy();
      expect(next.mock.calls[0][0].isJoi).toBe(true);
    });
});

test('calls next with errors when async schema fails', () => {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: (value, options) => Promise.reject(new ValidationError('message', 'type')),
  });

  expect.assertions(2);
  const next = jest.fn();
  return validator({string: 'hello'}, mockOptions, next)
    .then(() => {
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0]).toBeTruthy();
    });
});

test('calls next with null when joi and async schema passes', () => {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: (value, options) => Promise.resolve('hello'),
  });

  expect.assertions(3);
  const next = jest.fn();
  return validator({string: 'hello'}, mockOptions, next)
    .then(() => {
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0]).toBe(null);
      expect(next.mock.calls[0][1]).toEqual({
        string: 'hello',
      });
    });
});

test('error type matches type from validator', () => {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: (value, options) => Promise.reject(new ValidationError('message', 'type')),
  });

  expect.assertions(2);
  const next = jest.fn();
  return validator({string: 'hello'}, mockOptions, next)
    .then(() => {
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0].details[0].type).toBe('type');
    });
});

test('joiSchema exposed and matches passed schema', () => {
  const joiSchema = {
    string: Joi.string(),
  };

  const validator = asyncValidation(joiSchema, {
    string: (value, options) => Promise.resolve('hello'),
  });

  expect(validator.joiSchema).toEqual(joiSchema);
});

test('next is called with values matching values from validators');

test('next is called with no errors when arrays of async validators are used');
