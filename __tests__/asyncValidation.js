/* eslint no-undef: "off" */
const asyncValidation = require('../src/asyncValidation');
const Joi = require('joi');
const ValidationError = require('../src/ValidationError');

const mockOptions = {
  context: {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      host: 'localhost:9000',
      connection: 'close',
      'user-agent': 'Paw/3.1.2 (Macintosh; OS X/10.12.5) GCDHTTPRequest',
      'content-length': '15'
    },
    abortEarly: true,
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

test('throw error when joi schema fails', async () => {
  try {
    const validator = asyncValidation({
      string: Joi.string(),
    }, {
      string: (value, options) => Promise.resolve(123),
    });

    const res = await validator({string: 123}, mockOptions);
  }
  catch (error) {
    expect(error.isJoi).toBeTruthy();
    expect(error.name).toMatch('ValidationError');
  }
});

test('return with errors when async schema fails', async () => {
  expect.assertions(3);
  try {
    const validator = asyncValidation({
      string: Joi.string(),
    }, {
      string: (value, options) => Promise.reject(new ValidationError('message', 'type')),
    });

    const res = await validator({string: 'hello'}, mockOptions)
  }
  catch (error) {
    expect(error.details[0].message).toEqual('message');
    expect(error.isJoi).toBeFalsy();
    expect(typeof error).toBe('object');
  }
});

test('returns with null when joi and async schema passes', async () => {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: (value, options) => Promise.resolve('hello'),
  });

  expect.assertions(2);
  const res = await validator({string: 'hello'}, mockOptions)
  expect(typeof res).toBe('object');
  expect(res).toEqual({ string: 'hello' });
});

test('error type matches type from validator', async () => {
  expect.assertions(1);
  try {
    const validator = asyncValidation({
      string: Joi.string(),
    }, {
      string: (value, options) => Promise.reject(new ValidationError('message', 'type')),
    });

    const res = await validator({string: 'hello'}, mockOptions)
  }
  catch (error) {
    expect(error.details[0].type).toBe('type');
  }
});

test('joiSchema exposed and matches passed schema', async () => {
  const joiSchema = {
    string: Joi.string(),
  };

  const validator = asyncValidation(joiSchema, {
    string: (value, options) => Promise.resolve('hello'),
  });

  expect.assertions(1);
  expect(validator.joiSchema).toEqual(joiSchema);
});

test('validator is called returning values matching values from validators', async () => {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: (value, options) => Promise.resolve('new value'),
  });

  expect.assertions(1);
  const res = await validator({string: 'hello'}, mockOptions);
  expect(res).toEqual({ string: 'new value' });
});

test('next is called with no errors when arrays of async validators are used', async () => {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: [
      (value, options) => Promise.resolve('hello'),
      (value, options) => Promise.resolve('hello'),
    ]
  });

  expect.assertions(2);
  const res = await validator({string: 'hello'}, mockOptions);
  expect(res).not.toBeUndefined();
  expect(typeof res).toBe('object');
});

test('throws an error when arrays of async validators are used and one fails', async () => {
  expect.assertions(2);
  try {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: [
      (value, options) => Promise.resolve('hello'),
      (value, options) => Promise.reject(new ValidationError('message', 'type')),
    ]
  });
  const res = await validator({string: 'hello'}, mockOptions);
  }
  catch (error) {
    expect(typeof error).toBe('object');
    expect(error.details[0].type).toBe('type')
  }
});
