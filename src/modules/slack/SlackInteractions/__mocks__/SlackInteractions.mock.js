export const responseMessage = (text = 'Thank you for using Tembea') => ({
  attachments: undefined,
  channel: undefined,
  response_type: 'ephemeral',
  text
});

export const createPayload = (value = 'value', name = 'name') => ({
  actions: [{ value, name }]
});

export const respondMock = () => (jest.fn(value => value));
