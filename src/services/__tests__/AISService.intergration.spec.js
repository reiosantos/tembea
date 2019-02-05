import aisService from '../AISService';

describe('AISService', () => {
  it('should get user details from AIS endpoint', async () => {
    const AISTestUser = {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'test-user-admin@andela.com'
    };
    const result = await aisService.getUserDetails(AISTestUser.email);
    expect(result.first_name).toEqual(AISTestUser.firstName);
    expect(result.last_name).toEqual(AISTestUser.lastName);
    expect(result).toHaveProperty('placement');
    expect(result).toHaveProperty('picture');
  });
});
