# Hapi Async Validation

Add an asyncValidation function to use within your hapi routes. We also provide some validators to use with your bookshelf models.

## Installation

Come on you know how to do it

```
npm i @synapsestudios/hapi-async-validation
```

## Usage

### asyncValidation

The `asyncValidation()` function is provided which will take a normal joi schema as the first argument and an object containing synchronous validators in the second argument.

A validator function is a function that returns a promise. The promise should resolve successfully if the value is valid. Additionally the value in the request will be converted to whatever value is returned from the promise.

If the promise is rejected then the api will respond with the value from the rejected promise. If the value from the rejected promise is an instance of `ValidationError` then the error will be returned as a 401 in the same format as hapi's validation errors.

```
const asyncValidation = require('@synapsestudios/hapi-async-validation').asyncValidation;

// Simple example
server.route({
  method: 'POST',
  path: '/validate',
  handler: function (request, reply) {
    return reply({message: 'your request is valid'});
  },
  config: {
    validate: {
      payload: asyncValidation({
        someValue: Joi.number().integer().required(),
      }, {
        someValue: (value, options) => Promise.resolve(value),
      })
    }
  }
});

// Example with value conversion
server.route({
  method: 'POST',
  path: '/validate',
  handler: function (request, reply) {
    // payload.someValue will always be "new value" no matter what is passed to this route
    return reply({message: 'your request is valid'})
  },
  config: {
    validate: {
      payload: asyncValidation({
        someValue: Joi.number().integer().required(),
      }, {
        someValue: (value, options) => Promise.resolve('new value');
      })
    }
  }
});
```
