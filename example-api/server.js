const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const asyncValidation = require('../index').asyncValidation;

const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 9000,
});

// Add the route
server.route({
  method: 'POST',
  path: '/validate',
  handler: function (request, reply) {
    return reply({message: 'your request was valid'});
  },
  config: {
    validate: {
      payload: asyncValidation({
        testKey: Joi.number().integer().required(),
      }, {
        testKey: (value, options) => Promise.resolve(value),
      })
    }
  }
});

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
