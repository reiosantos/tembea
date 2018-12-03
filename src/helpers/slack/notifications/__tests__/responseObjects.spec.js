import { userResponse, opsResponse } from '../responseObjects';


describe('response objects test', () => {
  it('should test user response', () => {
    const data = {
      department: 'dpt',
      pickup: 'pick',
      destination: 'dest',
      requestDate: 'req',
      departureDate: 'dte'
    };

    const channel = {
      id: 1
    };

    const result = userResponse('1', 'user', data, channel);
    expect(result).toHaveProperty(
      'text', 'We have received your request. We shall be responding to it shortly.'
    );
  });

  it('should test user response', () => {
    const data = {
      department: 'dpt',
      pickup: 'pick',
      destination: 'dest',
      requestDate: 'req',
      departureDate: 'dte'
    };

    const result = opsResponse(1, 'trip', data, 'color');
    expect(result).toHaveProperty('text',
      '<@undefined> approved this trip. Ready for confirmation :smiley:');
    expect(result).toHaveProperty('attachments');
  });
});
