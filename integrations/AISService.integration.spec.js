import aISService from '../src/services/AISService';

describe.skip('AISService', () => {
  describe('getUserDetails', () => {
    it('should get user details', async () => {
      const testAISUser = {
        firstName: 'Abishai',
        lastName: 'Omari',
        email: 'abishai.omari@andela.com'
      };
      const result = await aISService.getUserDetails(testAISUser.email);
      expect(result.first_name).toEqual(testAISUser.firstName);
      expect(result.last_name).toEqual(testAISUser.lastName);
      expect(result).toHaveProperty('placement');
      expect(result).toHaveProperty('picture');
    });
  });
});
