import ProvidersHelper from '../ProvidersHelper';
import { providerService } from '../../../../../services/ProviderService';
import { returnedObj } from '../../../../../helpers/__mocks__/providersMock';
import UserService from '../../../../../services/UserService';

describe('ProvidersHelpers (Slack)', () => {
  describe('getProviderUserDetails', () => {
    const payload = { ...returnedObj.providers[0] };
    beforeEach((async () => {
      jest.spyOn(providerService, 'getProviderById').mockResolvedValue(payload);
      jest.spyOn(UserService, 'getUserById').mockResolvedValue({
        id: 1,
        name: 'Test Provider',
        slackId: 'UKXXXXXXX'
      });
    }));
    it('should get provider details', async () => {
      const providerUser = await ProvidersHelper.getProviderUserDetails(1);
      expect(providerService.getProviderById).toHaveBeenCalled();
      expect(UserService.getUserById).toHaveBeenCalled();
      expect(providerUser).toEqual({
        providerUserSlackId: 'UKXXXXXXX',
        providerName: 'Uber Kenya'
      });
    });
  });
});
