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

    const result = userResponse('user', data, { id: 1 });
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

    const result = opsResponse(1, 'trip', data, 'color')
    expect(result).toHaveProperty('text', '*Tembea* :oncoming_automobile:');
    expect(result).toHaveProperty('attachments');
  });
});
