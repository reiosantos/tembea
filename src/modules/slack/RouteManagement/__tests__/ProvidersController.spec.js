import RouteRequestService from '../../../../services/RouteRequestService';
import { mockRouteRequestData } from '../../../../services/__mocks__';
import ProviderNotifications from '../../SlackPrompts/notifications/ProviderNotifications/index';
import ProvidersController from '../ProvidersController';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import ConfirmRouteUseJob from '../../../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import RouteService from '../../../../services/RouteService';
import { providersPayload, state } from '../__mocks__/providersController.mock';

describe('Provider Controller', () => {
  let respond;
  let getRouteRequestAndToken;
  let payload;
  let completeProviderApprovedAction;
  let updateRouteRequest;
  beforeEach(() => {
    respond = jest.fn();
    getRouteRequestAndToken = jest.spyOn(RouteRequestService, 'getRouteRequestAndToken');
    updateRouteRequest = jest.spyOn(RouteRequestService, 'updateRouteRequest');
    completeProviderApprovedAction = jest.spyOn(
      ProviderNotifications, 'completeProviderApprovedAction'
    );
    jest.spyOn(ProvidersController, 'getFinalCabSubmissionDetails');
    payload = { ...providersPayload, state };
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should complete approve action if a cab and a driver is assigned by provider', async (done) => {
    getRouteRequestAndToken.mockResolvedValueOnce({
      routeRequest: { ...mockRouteRequestData },
      slackBotOauthToken: 'dfdf'
    });
    jest.spyOn(ProvidersController, 'saveRoute').mockResolvedValue();
    updateRouteRequest.mockResolvedValueOnce({
      ...mockRouteRequestData,
      status: 'Approved',
      opsComment: 'approved'
    });
    completeProviderApprovedAction.mockReturnValue('Token');
    await ProvidersController.handleProvidersRouteApproval(payload, respond);
    expect(RouteRequestService.getRouteRequestAndToken).toBeCalled();
    expect(RouteRequestService.updateRouteRequest).toHaveBeenCalled();
    expect(ProvidersController.getFinalCabSubmissionDetails).toBeCalled();
    expect(ProvidersController.saveRoute).toHaveBeenCalled();
    expect(ProviderNotifications.completeProviderApprovedAction).toHaveBeenCalled();
    done();
  });
  it('should save route', async (done) => {
    jest.spyOn(RouteService, 'createRouteBatch').mockResolvedValue({});
    jest.spyOn(ConfirmRouteUseJob, 'scheduleBatchStartJob').mockResolvedValue({});
    jest.spyOn(RouteService, 'addUserToRoute').mockResolvedValue({});

    await ProvidersController.saveRoute(mockRouteRequestData, payload, 1);

    expect(RouteService.addUserToRoute).toBeCalled();
    expect(ConfirmRouteUseJob.scheduleBatchStartJob).toHaveBeenCalled();
    expect(RouteService.createRouteBatch).toBeCalled();
    done();
  });
  it('should get the final submission', async () => {
    const vehicleData = {
      cab: 'TTTT, 789,ghvds',
      driver: '1, fgghvhb, 9876546789,1242342424',
      regNumber: 'sdsdds',
      routeCapacity: 2,
      driverId: 1
    };
    const result = await ProvidersController.getFinalCabSubmissionDetails(vehicleData);
    expect(result).toEqual({
      driverId: '1',
      driverName: ' fgghvhb',
      driverNumber: '1242342424',
      driverPhoneNumber: ' 9876546789',
      regNumber: 'ghvds',
      routeCapacity: 'TTTT'
    });
  });
  it('should throw an error', async (done) => {
    getRouteRequestAndToken.mockRejectedValueOnce('an error');
    jest.spyOn(bugsnagHelper, 'log');
    completeProviderApprovedAction.mockReturnValueOnce('Token');
    await ProvidersController.handleProvidersRouteApproval(payload, respond);
    expect(bugsnagHelper.log).toHaveBeenCalled();
    expect(respond.mock.calls[0][0].text).toEqual('Unsuccessful request. Kindly Try again');
    done();
  });
});
