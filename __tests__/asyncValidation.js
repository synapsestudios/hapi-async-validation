/* eslint no-undef: "off" */
const asyncValidation = require('../src/asyncValidation');
const Joi = require('joi');

const getMockOptions = () => ({
  context: {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      host: 'localhost:9000',
      connection: 'close',
      'user-agent': 'Paw/3.1.2 (Macintosh; OS X/10.12.5) GCDHTTPRequest',
      'content-length': '15',
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
      error: null,
    },
    app: {
      route: {},
      request: {},
    },
  },
});

test(`returns a function and doesn't crash`, () => {
  const validator = asyncValidation();
  expect(typeof validator).toBe('function');
});

test('throw error when joi schema fails', async () => {
  try {
    const validator = asyncValidation({
      val: Joi.string(),
    }, {
      val: async (value, options) => Promise.resolve(),
    });

    const res = await validator({ val: 123 }, getMockOptions());
  } catch (error) {
    expect(error.isJoi).toBeTruthy();
    expect(error.name).toMatch('ValidationError');
  }
});

test('throw error when async schema fails', async () => {
  expect.assertions(3);
  try {
    const validator = asyncValidation({
      val: Joi.string(),
    }, {
      val: async (value, options) => {
        throw new Error('Invalid value');
      },
    });

    const res = await validator({ val: 'hello' }, getMockOptions())
  } catch (error) {
    expect(typeof error).toBe('object');
    expect(error.name).toMatch('Error');
    expect(error.message).toEqual('Invalid value');
  }
});

test('returns values when joi and async schema passes', async () => {
  expect.assertions(2);
  const validator = asyncValidation({
    val: Joi.string(),
  }, {
    val: async (value, options) => 'hello',
  });

  const res = await validator({ val: 'hello'}, getMockOptions())
  expect(typeof res).toBe('object');
  expect(res).toEqual({ val: 'hello' });
});

test('error type matches type from validator', async () => {
  expect.assertions(1);
  try {
    const validator = asyncValidation({
      val: Joi.string(),
    }, {
      val: async (value, options) => {
        throw new Error('Invalid value');
      },
    });

    const res = await validator({ val: 'hello' }, getMockOptions())
  } catch (error) {
    expect(error.message).toEqual('Invalid value');
  }
});

test('joiSchema exposed and matches passed schema', async () => {
  expect.assertions(1);
  const joiSchema = {
    val: Joi.string(),
  };

  const validator = asyncValidation(joiSchema, {
    string: (value, options) => Promise.resolve('hello'),
  });

  expect(validator.joiSchema).toEqual(joiSchema);
});

test('validator is called returning values matching values from validators', async () => {
  expect.assertions(1);
  const validator = asyncValidation({
    val: Joi.string(),
  }, {
    val: async (value, options) => 'new value',
  });

  const res = await validator({ val: 'hello' }, getMockOptions());
  expect(res).toEqual({ val: 'new value' });
});

test('next is called with no errors when arrays of async validators are used', async () => {
  expect.assertions(2);
  const validator = asyncValidation({
    val: Joi.string(),
  }, {
    val: [
      async (value, options) => 'hello',
      async (value, options) => 'hello',
    ],
  });

  const res = await validator({ val: 'hello' }, getMockOptions());
  expect(res).not.toBeUndefined();
  expect(typeof res).toBe('object');
});

test('throws an error when arrays of async validators are used and one fails', async () => {
  expect.assertions(2);
  try {
    const validator = asyncValidation({
      val: Joi.string(),
    }, {
      val: [
        async (value, options) => 'hello',
        async (value, options) => {
          throw new Error('Invalid value');
        },
      ],
    });

    const res = await validator({ val: 'hello' }, getMockOptions());
  } catch (error) {
    expect(typeof error).toBe('object');
    expect(error.message).toBe('Invalid value')
  }
});
