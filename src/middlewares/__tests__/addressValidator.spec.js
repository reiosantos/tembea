import AddressValidator from '../AddressValidator';

describe('AddressValidator_validateProps', () => {
  it('should return error for invalid longitude and latitude', (done) => {
    const messages = [];

    AddressValidator.validateProps('invalid', '-11invalid', messages);
    expect(messages).toEqual([
      'Invalid longitude should be between -180 and 180',
      'Invalid latitude should be between -86 and 86'
    ]);
    done();
  });
});
