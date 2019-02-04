import JoinRouteInputHandlers from '../JoinRouteInputHandler';
import JoinRouteInteractions from '../JoinRouteInteractions';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import JoinRouteHelpers from '../JoinRouteHelpers';
import { SlackAttachment, SlackInteractiveMessage } from '../../../SlackModels/SlackMessageModels';
import { SlackEvents } from '../../../events/slackEvents';
import FormValidators from '../JoinRouteFormValidators';
import JoinRouteNotifications from '../JoinRouteNotifications';
import { Bugsnag } from '../../../../../helpers/bugsnagHelper';
import JoinRouteDialogPrompts from '../JoinRouteDialogPrompts';
import WebClientSingleton from '../../../../../utils/WebClientSingleton';

const error = new SlackInteractiveMessage('Unsuccessful request. Kindly Try again');
describe('JoinInputHandlers', () => {
  const respond = jest.fn();
  const submission = {
    partnerName: 'partner',
    workHours: '18:00-00:00',
    startDate: '12/12/2019',
    endDate: '12/12/2020'
  };

  beforeEach(() => {
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('token');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('routeSelected', () => {
    let detailsFormSpy;
    const payload = { actions: [{ value: 1 }], trigger_id: 'triggerId', team: { id: 'teamId' } };

    beforeEach(() => {
      detailsFormSpy = jest.spyOn(JoinRouteDialogPrompts, 'sendFellowDetailsForm');
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should call sendFellowDetailsForm', async () => {
      const webSpy = jest.spyOn(WebClientSingleton.prototype, 'getWebClient')
        .mockImplementation(() => ({
          dialog: {
            open: jest.fn()
          }
        }));
      await JoinRouteInputHandlers.routeSelected(payload, respond);
      expect(detailsFormSpy).toBeCalledWith(payload, 1);
      expect(webSpy).toBeCalled();
      expect(respond).toBeCalledWith(new SlackInteractiveMessage('Noted...'));
    });

    it('should log caught error on bugsnag', async () => {
      detailsFormSpy.mockImplementation(() => { throw new Error('very error'); });
      const spy = jest.spyOn(Bugsnag.prototype, 'log');
      await JoinRouteInputHandlers.routeSelected(payload, respond);
      expect(respond).toBeCalledWith(error);
      expect(spy).toBeCalledWith(new Error('very error'));
    });
  });

  describe('fellowDetails', () => {
    const data = {
      callback_id: 'join_route_fellowDetails_1',
      submission: { ...submission },
      user: { id: 'testId', name: 'test.user' },
    };
    beforeEach(() => {
      jest.spyOn(JoinRouteHelpers, 'joinRouteAttachments')
        .mockResolvedValue(new SlackAttachment());
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should call respond()', async () => {
      const fieldOrActionSpy = jest.spyOn(SlackAttachment.prototype, 'addFieldsOrActions');
      const addPropsSpy = jest.spyOn(SlackAttachment.prototype, 'addOptionalProps');
      await JoinRouteInputHandlers.fellowDetails(data, respond);
      expect(respond).toBeCalledTimes(1);
      expect(fieldOrActionSpy).toBeCalledTimes(2);
      expect(addPropsSpy).toBeCalledTimes(2);
    });
    it('should not call respond() if submission data from payload has errors', async () => {
      const invalidData = { ...data, submission: { ...data.submission, partnerName: '   ' } };
      const result = await JoinRouteInputHandlers.fellowDetails(invalidData, respond);
      expect(respond).not.toBeCalled();
      expect(result).toHaveProperty('errors');
    });
    it('should log a caught error on bugsnag', async () => {
      jest.spyOn(FormValidators, 'validateFellowDetailsForm')
        .mockImplementationOnce(() => { throw new Error('very error'); });
      const spy = jest.spyOn(Bugsnag.prototype, 'log');
      await JoinRouteInputHandlers.fellowDetails(data, respond);
      expect(spy).toBeCalledWith(new Error('very error'));
      expect(respond).toBeCalledWith(error);
    });
  });

  describe('submitJoinRoute', () => {
    let spy;
    let saveRequest;
    const payload = {
      actions: [{ value: 'confirmButton' }],
      user: { id: 'slackId' }
    };
    beforeEach(() => {
      spy = jest.spyOn(SlackEvents, 'raise');
      saveRequest = jest.spyOn(JoinRouteHelpers, 'saveJoinRouteRequest');
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('confirmButton: it should save join route request and raise manager event', async () => {
      saveRequest.mockResolvedValue({ id: 2 });
      await JoinRouteInputHandlers.submitJoinRoute(payload, respond);
      expect(respond).toBeCalledWith(new SlackInteractiveMessage(
        'Hey <@slackId> :smiley:, your request has been received and will be responded to shortly.'
      ));
      expect(spy).toBeCalledWith('manager_receive_join_route', payload, 2);
    });

    it('should respond with an error message if request isn\'t saved successfully', async () => {
      saveRequest.mockResolvedValue(null);
      await JoinRouteInputHandlers.submitJoinRoute(payload, respond);
      expect(respond).toBeCalledWith(new SlackInteractiveMessage(
        'Hey <@slackId> :pensive:, your request was unsuccessful. Kindly Try again.'
      ));
      expect(spy).not.toBeCalled();
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
      expect(spy).toBeCalledTimes(1);
    });

    it('should send goodBye message when cancel button is clicked', async () => {
      const payload = {
        actions: [{ value: 'cancel' }],
        user: { id: 'slackId' }
      };
      await JoinRouteInputHandlers.backButton(payload, respond);
      expect(respond).toBeCalledWith(
        new SlackInteractiveMessage('Thank you for using Tembea. See you again.')
      );
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

  it('should return goodbye message if input handler  from callback_id is not found', async () => {
    const data = { ...payload, callback_id: 'join_route_iDontExist' };
    await JoinRouteInteractions.handleJoinRouteActions(data, respond);
    expect(respond).toBeCalledWith(new SlackInteractiveMessage(
      'Thank you for using Tembea. See you again.'
    ));
  });

  it('should log caught error on bugsnag', async () => {
    jest.spyOn(String.prototype, 'split')
      .mockImplementationOnce(() => { throw new Error('very error'); });
    const spy = jest.spyOn(Bugsnag.prototype, 'log');
    await JoinRouteInteractions.handleJoinRouteActions(payload, respond);
    expect(spy).toBeCalledWith(new Error('very error'));
    expect(respond).toBeCalledWith(error);
  });
});
