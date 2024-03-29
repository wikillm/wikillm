// @ts-nocheck
/* eslint-disable */
const toTypeObj = (name, type, required) => {
  if (name.endsWith('$')) {
    name = name.replace(/\$$/, '');
    required.push(name);
  }
  if (type.startsWith('#/')) {
    return [
      name,
      {
        $ref: type.replace('#/', '#/definitions/'),
      },
      required,
    ];
  }
  return [
    name,
    {
      type,
    },
    required,
  ];
};
const traverse = ({ definitions, properties, ...rest }) => {
  let required = [];
  if (definitions) {
  }
  return {
    definitions:
      definitions &&
      Object.keys(definitions)
        .map((name) => {
          return { name, definition: traverse(definitions[name]) };
        })
        .reduce(
          (keyValue, { name, definition }) => ({
            ...keyValue,
            [name]: definition,
          }),
          {}
        ),
    ...rest,
    type: 'object',
    properties: Object.keys(properties)
      .map((name) => {
        let property = properties[name];
        if (typeof property.items === 'string') {
          property.type = 'array';
          [name, property, required] = toTypeObj(
            name,
            property.items,
            required
          );
        }
        if (property.items?.properties) {
          property.items = traverse(property.items);
        }
        if (property.properties) {
          property = traverse(property);
        }

        if (typeof property === 'string') {
          [name, property, required] = toTypeObj(name, property, required);
        }
        return { name, property };
      })
      .reduce(
        (keyValue, { name, property }) => ({ ...keyValue, [name]: property }),
        {}
      ),
    required,
  };
};
export const expandSchema = ({ properties, ...definitions }) => {
  const mainSchema = {
    definitions,
    properties,
  };
  // const definitions = schema.definitions;
  const newMainSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    ...traverse(mainSchema),
  };
  // console.log(newMainSchema);
  return newMainSchema;
};
const schemas = expandSchema({
  question: {
    properties: {
      name: 'string',
      each: 'string',
      loop$: {
        properties: {
          name: ['string', 'textarea'],
          values: {
            title: 'Add a value',
            items: 'string',
          },
        },
      },
      question: ['string', 'textarea'],
      children$: {
        items: '#/question',
      },
    },
  },
  properties: {
    inputSchema: {
      properties: {
        name: 'string',
        type: 'string',
      },
    },
    objective$: 'string',
    questions: {
      items: '#/question',
    },
  },
});
