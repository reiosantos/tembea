import JoinRouteInputHandlers from '../JoinRouteInputHandler';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import JoinRouteHelpers from '../JoinRouteHelpers';
import { SlackAttachment, SlackInteractiveMessage } from '../../../SlackModels/SlackMessageModels';
import { slackEventNames, SlackEvents } from '../../../events/slackEvents';
import FormValidators from '../JoinRouteFormValidators';
import JoinRouteNotifications from '../JoinRouteNotifications';
import { Bugsnag } from '../../../../../helpers/bugsnagHelper';
import JoinRouteDialogPrompts from '../JoinRouteDialogPrompts';
import RouteService from '../../../../../services/RouteService';
import { mockRouteBatchData } from '../../../../../services/__mocks__';
import JoinRouteRequestService from '../../../../../services/JoinRouteRequestService';
import JoinRouteInteractions from '../JoinRouteInteractions';
import * as formHelper from '../../../helpers/formHelper';
import UserService from '../../../../../services/UserService';
import PartnerService from '../../../../../services/PartnerService';

const error = new SlackInteractiveMessage('Unsuccessful request. Kindly Try again');
describe('JoinInputHandlers', () => {
  const respond = jest.fn();
  const submission = {
    partnerName: 'partner',
    workHours: '18:00-00:00',
    startDate: '12/12/2019',
    endDate: '12/12/2020'
  };

  const engagement = {
    id: 1,
    partnerName: 'partner',
    workHours: '18:00-00:00',
    startDate: '12/12/2019',
    endDate: '12/12/2020',
    partnerStatus: 'ss'
  };


  beforeEach(() => {
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('token');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('joinRoute', () => {
    let detailsFormSpy;
    const payload = {
      actions: [{ value: 1 }], trigger_id: 'triggerId', team: { id: 'teamId' }, user: { id: 1 }
    };

    beforeEach(() => {
      detailsFormSpy = jest.spyOn(JoinRouteDialogPrompts, 'sendFellowDetailsForm')
        .mockResolvedValue();
      jest.spyOn(JoinRouteInteractions, 'fullRouteCapacityNotice')
        .mockResolvedValue();
      jest.spyOn(RouteService, 'getRoute');
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should call sendFellowDetailsForm', async () => {
      RouteService.getRoute.mockResolvedValue({ ...mockRouteBatchData, riders: [] });
      jest.spyOn(formHelper, 'getFellowEngagementDetails')
        .mockResolvedValue(engagement);
      jest.spyOn(UserService, 'getUserBySlackId')
        .mockResolvedValue({ slackId: 'ss' });
      await JoinRouteInputHandlers.joinRoute(payload, respond);
      expect(detailsFormSpy)
        .toBeCalledWith(payload, JSON.stringify({ routeId: 1, capacityFilled: false }), engagement);
      expect(RouteService.getRoute).toHaveBeenCalledWith(1);
    });
    it('should stop fellow with a route', async () => {
      RouteService.getRoute.mockResolvedValue({ ...mockRouteBatchData, riders: [{ slackId: 'ss' }] });
      jest.spyOn(formHelper, 'getFellowEngagementDetails')
        .mockResolvedValue(engagement);
      jest.spyOn(UserService, 'getUserBySlackId')
        .mockResolvedValue({ slackId: 'ABCDEF', routeBatchId: 'aaa' });
      const restrictions = jest.spyOn(JoinRouteInputHandlers, 'joinRouteHandleRestrictions');
      await JoinRouteInputHandlers.joinRoute(payload, respond);
      expect(respond).toBeCalledTimes(1);
      expect(restrictions).toBeCalledTimes(1);
    });
    it('should stop fellow who is not on engagement', async () => {
      RouteService.getRoute.mockResolvedValue({ ...mockRouteBatchData, riders: [] });
      const notOnEngagement = null;
      jest.spyOn(UserService, 'getUserBySlackId')
        .mockResolvedValue({ slackId: 'ss' });
      jest.spyOn(formHelper, 'getFellowEngagementDetails')
        .mockResolvedValue(notOnEngagement);
      await JoinRouteInputHandlers.joinRoute(payload, respond);
      expect(respond).toBeCalledTimes(1);
      expect(respond).toHaveBeenCalledWith({
        as_user: false,
        attachments: undefined,
        channel: undefined,
        response_type: 'ephemeral',
        text: `Sorry it appear you are not on any engagement at the moment.
        If you believe this is incorrect, contact Tembea Support.`,
        user: undefined
      });
    });
    it('should send full capacity notice to user', async () => {
      jest.spyOn(formHelper, 'getFellowEngagementDetails')
        .mockResolvedValue(engagement);
      const copy = {};
      Object.assign(copy, mockRouteBatchData);
      copy.riders.push(...[{}, {}]);
      jest.spyOn(UserService, 'getUserBySlackId')
        .mockResolvedValue({ slackId: 'ss' });
      RouteService.getRoute.mockResolvedValue(mockRouteBatchData);
      await JoinRouteInputHandlers.joinRoute(payload, respond);
      expect(detailsFormSpy).not.toBeCalled();
      expect(JoinRouteInteractions.fullRouteCapacityNotice)
        .toBeCalledWith(copy.id);
      expect(RouteService.getRoute)
        .toHaveBeenCalledWith(1);
    });
    it('should log caught error on bugsnag', async () => {
      RouteService.getRoute.mockRejectedValue(new Error('very error'));
      const spy = jest.spyOn(Bugsnag.prototype, 'log');
      await JoinRouteInputHandlers.joinRoute(payload, respond);
      expect(respond).toBeCalledWith(error);
      expect(spy).toBeCalledWith(new Error('very error'));
    });
  });

  describe('continueJoinRoute', () => {
    const payload = {
      actions: [{ value: 1 }], trigger_id: 'triggerId', team: { id: 'teamId' }, user: { id: 1 }
    };
    beforeEach(() => {
      jest.spyOn(JoinRouteDialogPrompts, 'sendFellowDetailsForm')
        .mockResolvedValue();
      jest.spyOn(formHelper, 'getFellowEngagementDetails')
        .mockResolvedValue(engagement);
    });
    it('should continue with join route request', async () => {
      await JoinRouteInputHandlers.continueJoinRoute(payload, respond);
      expect(JoinRouteDialogPrompts.sendFellowDetailsForm)
        .toBeCalledWith(payload, JSON.stringify({ routeId: 1, capacityFilled: true }), engagement);
      expect(respond).toBeCalledWith(new SlackInteractiveMessage('Noted'));
    });
    it('should stop fellow who is not on engagement', async () => {
      const notengagement = null;
      jest.spyOn(formHelper, 'getFellowEngagementDetails')
        .mockResolvedValue(notengagement);
      await JoinRouteInputHandlers.continueJoinRoute(payload, respond);
      expect(respond).toBeCalledTimes(1);
      expect(respond).toHaveBeenCalledWith({
        as_user: false,
        attachments: undefined,
        channel: undefined,
        response_type: 'ephemeral',
        text: `Sorry it appear you are not on any engagement at the moment.
        If you believe this is incorrect, contact Tembea Support.`,
        user: undefined
      });
    });
  });

  describe('fellowDetails', () => {
    const data = {
      callback_id: 'join_route_fellowDetails_1',
      submission: { ...submission },
      user: { id: 'testId', name: 'test.user' },
      team: { id: 'testId', name: 'test.user' },
      state: JSON.stringify({ routeId: 1 })
    };
    beforeEach(() => {
      jest.spyOn(JoinRouteNotifications, 'sendFellowDetailsPreview');
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should call respond()', async () => {
      JoinRouteNotifications.sendFellowDetailsPreview
        .mockResolvedValue('preview attachment');

      await JoinRouteInputHandlers.fellowDetails(data, respond);
      expect(respond).toBeCalledWith('preview attachment');
    });
    it('should not call respond() if submission data from payload has errors', async () => {
      const invalidData = { ...data, submission: { ...data.submission, partnerName: '   ' } };
      const result = await JoinRouteInputHandlers.fellowDetails(invalidData, respond);
      expect(respond).not.toBeCalled();
      expect(result).toHaveProperty('errors');
    });
    it('should handle validation error', async () => {
      jest.spyOn(FormValidators, 'validateFellowDetailsForm')
        .mockReturnValue([{}]);
      await JoinRouteInputHandlers.fellowDetails(data, respond);
    });
    it('should log a caught error on bugsnag', async () => {
      const errors = new Error('very error');
      JoinRouteNotifications.sendFellowDetailsPreview
        .mockRejectedValue(errors);
      const spy = jest.spyOn(Bugsnag.prototype, 'log');
      await JoinRouteInputHandlers.fellowDetails(data, respond);
      expect(spy).toBeCalledWith(errors);
      expect(respond).toBeCalledWith(error);
    });
  });

  describe('showAvailableRoutes', () => {
    it('should send available routes prompt', async () => {
      jest.spyOn(JoinRouteInteractions, 'sendAvailableRoutesMessage')
        .mockReturnValue();
      await JoinRouteInputHandlers.showAvailableRoutes({}, respond);
      expect(JoinRouteInteractions.sendAvailableRoutesMessage).toHaveBeenCalled();
    });
  });

  describe('submitJoinRoute', () => {
    let payload;
    beforeEach(() => {
      const value = JSON.stringify({ routeId: 1, capacityFilled: false });
      payload = {
        actions: [{ value }],
        user: { id: 'slackId' },
        team: { id: 'teamId' },
      };
      jest.spyOn(JoinRouteHelpers, 'saveJoinRouteRequest')
        .mockResolvedValue({ id: 2, dataValues: { engagementId: 2 } });
      jest.spyOn(JoinRouteRequestService, 'updateJoinRouteRequest')
        .mockResolvedValue();
      jest.spyOn(SlackEvents, 'raise').mockReturnValue();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should save join request and send notification to managers', async (done) => {
      const routeId = 1;
      const value = JSON.stringify({ routeId, capacityFilled: false });
      payload = { ...payload, actions: [{ value }] };
      jest.spyOn(UserService, 'getUserBySlackId')
        .mockResolvedValue({ id: 1 });
      jest.spyOn(PartnerService, 'updateEngagement').mockResolvedValue({ id: 1 });
      jest.spyOn(RouteService, 'addUserToRoute').mockResolvedValue({ id: 1 });
      jest.spyOn(formHelper, 'getFellowEngagementDetails')
        .mockResolvedValue(engagement);

      await JoinRouteInputHandlers.submitJoinRoute(payload, respond);
      expect(respond).toBeCalledTimes(1);
      expect(JoinRouteHelpers.saveJoinRouteRequest).toBeCalledWith(payload, 1);
      expect(SlackEvents.raise)
        .toBeCalledWith(slackEventNames.MANAGER_RECEIVE_JOIN_ROUTE, payload, 2);
      done();
    });
    it('should send request to ops when user trying to join a full route', async () => {
      const routeId = 1;
      const value = JSON.stringify({ routeId, capacityFilled: true });
      payload = { ...payload, actions: [{ value }] };

      await JoinRouteInputHandlers.submitJoinRoute(payload, respond);

      expect(respond).toBeCalledTimes(1);
      expect(SlackEvents.raise)
        .toBeCalledWith(slackEventNames.OPS_FILLED_CAPACITY_ROUTE_REQUEST, {
          routeId,
          teamId: payload.team.id,
          requesterSlackId: payload.user.id,
        });
    });
  });

  describe('backButton', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should send available routes prompt when back button is clicked', async () => {
      const payload = {
        actions: [{ value: 'back' }],
        user: { id: 'slackId' }
      };
      const spy = jest.spyOn(JoinRouteInteractions, 'sendAvailableRoutesMessage')
        .mockImplementation(jest.fn());
      await JoinRouteInputHandlers.backButton(payload, respond);
      expect(spy)
        .toBeCalledTimes(1);
    });
    it('should send goodbye message ', async () => {
      const payload = {
        actions: [{ value: 'not back' }],
        user: { id: 'slackId' }
      };
      await JoinRouteInputHandlers.backButton(payload, respond);
      expect(respond)
        .toBeCalledTimes(1);
      expect(respond)
        .toBeCalledWith({
          as_user: false,
          attachments: undefined,
          channel: undefined,
          response_type: 'ephemeral',
          text: 'Thank you for using Tembea. See you again.',
          user: undefined
        });
    });
  });
});

describe('JoinRouteInteractions', () => {
  const respond = jest.fn();
  const payload = {
    callback_id: 'join_route_fellowDetails_1',
    submission: {
      partnerName: 'partner',
      workHours: '18:00-00:00',
      startDate: '12/12/2019',
      endDate: '12/12/2020'
    },
  };

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should call appropriate input handler from callback_id', async () => {
    const spy = jest.spyOn(FormValidators, 'validateFellowDetailsForm');
    const detailsPreviewSpy = jest.spyOn(JoinRouteNotifications, 'sendFellowDetailsPreview')
      .mockImplementationOnce(() => ({}));
    const result = await JoinRouteInteractions.handleJoinRouteActions(payload, respond);
    expect(spy).toBeCalledWith(payload);
    expect(detailsPreviewSpy).toBeCalled();
    expect(result).toBe(undefined);
  });
  describe('JoinRouteInteractivePrompts', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    describe('fullRouteCapacityNotice', () => {
      it('should send an interactive message of available routes', () => {
        const fieldsOrActionSpy = jest.spyOn(SlackAttachment.prototype, 'addFieldsOrActions');
        const addPropsSpy = jest.spyOn(SlackAttachment.prototype, 'addOptionalProps');
        const attachment = JoinRouteInteractions.fullRouteCapacityNotice('state');
        expect(fieldsOrActionSpy).toBeCalledTimes(1);
        expect(fieldsOrActionSpy.mock.calls[0][0]).toEqual('actions');
        expect(fieldsOrActionSpy.mock.calls[0][1]).toBeInstanceOf(Array);
        expect(fieldsOrActionSpy.mock.calls[0][1].length).toEqual(2);
        expect(addPropsSpy).toBeCalledWith('join_route_actions');
        expect(attachment).toBeInstanceOf(SlackInteractiveMessage);
      });
    });
  });
});
