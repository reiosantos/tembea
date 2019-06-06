import { providersPayload } from '../../../RouteManagement/__mocks__/providersController.mock';
import ProvidersHelper from '../ProvidersHelper';

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
