const asyncValidation = require('./asyncValidation');
const Joi = require('joi');

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

test('calls next with errors when joi schema fails', (done) => {
  const validator = asyncValidation({
    string: Joi.string(),
  }, {
    string: (value, options) => Promise.resolve(123),
  });

  const next = jest.fn().mockImplementation((err, values) => {
    expect(err).toBeTruthy();
    expect(err.isJoi).toBe(true);
    done();
  });

  validator({string: 123}, mockOptions, next)
    .catch(e => {
      // gulp
    });
});

test('calls next with errors when async schema fails');
test('calls next with null when joi and async schema passes');
test('error type matches type from validator');
test('joiSchema exposed and matches passed schema');
test('next is called with values matching values from validators');
