const FormSchema = require('@synapsestudios/form-schema');
const get = require('lodash/get');

module.exports = (
  ValidationError,
  bookshelf,
  ...adapterObjects
) => (schema = 'schema', schemaToMatch) => (value, options) => {

  const formSchema = new FormSchema(value);
  adapterObjects.forEach(adapter => {
    formSchema.registerValidator(adapter);
  });

  let schemaMatchPromise;
  if (
    schemaToMatch
    && schemaToMatch.model
    && schemaToMatch.column
    && schemaToMatch.contextValuePath
  ) {
    const contextValue = get(options.context, schemaToMatch.contextValuePath);
    schemaMatchPromise = bookshelf.model(schemaToMatch.model).where('id', contextValue).fetch()
      .then(model => model.get(schemaToMatch.column))
      .then(customForm => {
        const safeSchema = new FormSchema(customForm);
        if (!safeSchema.doesSchemaMatch(formSchema)) {
          throw new ValidationError('Custom fields do not match', 'customFields', formSchema.serialize());
        }
      });
  } else {
    schemaMatchPromise = Promise.resolve();
  }

  return schemaMatchPromise
    .then(() => formSchema.validate(schema))
    .then(isValid => {
      if (isValid) {
        return formSchema;
      } else {
        throw new ValidationError('Custom fields error', 'customFields', formSchema.serialize());
      }
    });
}

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'validator/validation-error',
  'bookshelf',
  'validator/form-schema-adapter',
  'validator/form-values-adapter',
];
