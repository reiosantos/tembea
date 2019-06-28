import { providersPayload } from '../../../RouteManagement/__mocks__/providersController.mock';
import ProvidersHelper from '../ProvidersHelper';
import { providerService } from '../../../../../services/ProviderService';
import { returnedObj } from '../../../../../helpers/__mocks__/providersMock';
import UserService from '../../../../../services/UserService';

describe('ProvidersHelpers (Slack)', () => {
  describe('selectCabDialogHelper', () => {
    it('provider helper should send back cab data', async () => {
      providersPayload.actions[0].value = 'accept_request_3_{"routeName":"sdf","takeOffTime":"01:30","Provider":"1,Uber Kenya,15"}';
      const result = await ProvidersHelper.selectCabDialogHelper('providers_route_approval', providersPayload, 1);
      expect(result).toEqual(
        {
          callbackId: 'providers_approval_route',
          where: { providerId: '1' }
        }
      );
    });
  });

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
