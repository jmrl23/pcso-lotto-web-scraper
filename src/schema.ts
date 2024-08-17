export const resultsGetSchema = {
  type: 'object',
  required: ['from'],
  additionalProperties: false,
  properties: {
    from: {
      type: 'string',
    },
    to: {
      type: 'string',
    },
    games: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
} as const;
