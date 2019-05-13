
import RouteRequestService from '../../../../../services/RouteRequestService';
import { mockRouteRequestData } from '../../../../../services/__mocks__';
import OperationsNotifications from '../../../SlackPrompts/notifications/OperationsRouteRequest';
import OperationsHelper from '../OperationsHelper';
import CabService from '../../../../../services/CabService';


describe('operations approve request', () => {
  let payload;
  let getRouteRequestAndToken;
  let completeOperationsApprovedAction;
  let updateRouteRequest;
  let routeRequestId;
  let timeStamp;
  let channelId;

  beforeAll(() => {
    getRouteRequestAndToken = jest.spyOn(RouteRequestService, 'getRouteRequestAndToken');
    updateRouteRequest = jest.spyOn(RouteRequestService, 'updateRouteRequest');
    completeOperationsApprovedAction = jest.spyOn(
      OperationsNotifications, 'completeOperationsApprovedAction'
    );
    payload = {
      submission: {
        declineReason: 'QQQQQQ', startDate: '31/01/2019', endDate: '20/02/2019'
      },
      actions: [{ name: 'action', value: '1' }],
      channel: { id: 1 },
      team: { id: 'TEAMID1' },
      original_message: { ts: 'timestamp' },
      user: { id: '4' }
    };
    ({ channel: { id: channelId }, original_message: { ts: timeStamp } } = payload);
    ({ id: routeRequestId } = mockRouteRequestData);

    const state = JSON.stringify({
      approve: {
        timeStamp, channelId, routeRequestId
      }
    });
    payload = {
      ...payload,
      submission: {
        routeName: 'QQQQQQ', takeOffTime: '12:30', cab: 'JDD3883, SDSAS, DDDDD'
      },
      callback_id: 'operations_route_approvedRequest',
      state
    };
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('get cab details if number plate is selected from dropdown', async (done) => {
    getRouteRequestAndToken.mockResolvedValue(
      { routeRequest: { ...mockRouteRequestData }, slackBotOauthToken: 'dfdf' }
    );
    updateRouteRequest.mockResolvedValue(
      { ...mockRouteRequestData, status: 'Approved' }
    );
    jest.spyOn(OperationsHelper, 'getCabSubmissionDetails');
    await OperationsHelper.sendOpsData(payload);
    expect(RouteRequestService.getRouteRequestAndToken).toHaveBeenCalled();
    expect(RouteRequestService.updateRouteRequest).toHaveBeenCalled();
    expect(OperationsHelper.getCabSubmissionDetails).toHaveBeenCalled();
    completeOperationsApprovedAction.mockReturnValue('Token');
    done();
  });
  it('get cab details if a new cab is created', async (done) => {
    payload.callback_id = 'operations_reason_dialog_route';
    payload.submission = {
      cab: 'Create New Cab',
      driverName: 'James',
      driverPhoneNo: 888288912981,
      regNumber: 'KCB 00P',
      capacity: 2,
      model: 'Toyota'
    };

    jest.spyOn(CabService, 'findOrCreateCab').mockResolvedValue({ data: {} });
    await OperationsHelper.getCabSubmissionDetails(payload, payload.submission);
    expect(CabService.findOrCreateCab).toBeCalled();
    done();
  });
});
