import InteractivePrompts from '../InteractivePrompts';
import InteractivePromptsHelpers from '../../helpers/slackHelpers/InteractivePromptsHelpers';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import { SlackButtonsAttachmentFromAList } from '../../SlackModels/SlackMessageModels';
import {
  sendBookNewTripMock,
  sendCompletionResponseMock,
  tripHistoryMock
} from '../__mocks__/InteractivePrompts.mock';
import LocationPrompts from '../LocationPrompts';

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../../slack/events/', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));
jest.mock('../../events/slackEvents', () => ({
  SlackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
  slackEventNames: Object.freeze({
    TRIP_APPROVED: 'trip_approved',
    TRIP_WAITING_CONFIRMATION: 'trip_waiting_confirmation',
    NEW_TRIP_REQUEST: 'new_trip_request',
    DECLINED_TRIP_REQUEST: 'declined_trip_request'
  })
}));

describe('Interactive Prompts test', () => {
  it('should sendBookNewTrip Response', (done) => {
    const respond = jest.fn(value => value);
    const payload = jest.fn(() => 'respond');
    const result = InteractivePrompts.sendBookNewTripResponse(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalledWith(sendBookNewTripMock);
    done();
  });

  it('should create view open trips response', (done) => {
    const respond = jest.fn(value => value);
    const payload = { user: { id: 1 }, submission: { rider: 1 } };
    const result = InteractivePrompts.sendCompletionResponse(payload, respond, 1);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalledWith(sendCompletionResponseMock);

    done();
  });

  it('should send decline response', (done) => {
    InteractivePrompts.messageUpdate = jest.fn();
    const tripInitial = {
      id: 2,
      requestId: null,
      departmentId: 23,
      tripStatus: 'Approved',
      department: null,
      destination: { dataValues: {} },
      origin: { dataValues: {} },
      pickup: { },
      departureDate: null,
      requestDate: new Date(),
      requester: { dataValues: {} },
      rider: { dataValues: { slackId: 2 } },
    };
    InteractivePrompts.sendManagerDeclineOrApprovalCompletion(true, tripInitial, 'timeStamp', 1);
    expect(InteractivePrompts.messageUpdate).toBeCalled();
    done();
  });

  it('should sendRescheduleCompletion response', (done) => {
    const trip = { dataValues: { id: 1 } };
    const result = InteractivePrompts.sendRescheduleCompletion(trip);

    expect(result).toHaveProperty('attachments');
    done();
  });

  it('should SendRescheduleError response', (done) => {
    const trip = { dataValues: { id: 23 } };
    const result = InteractivePrompts.sendRescheduleError(trip);

    expect(result).toHaveProperty('attachments');
    done();
  });

  it('should SendTripError response', (done) => {
    const result = InteractivePrompts.sendTripError();

    expect(result).toHaveProperty('text', 'Dang! I hit an error with this trip');
    done();
  });

  it('should send upcoming trips', async () => {
    const response = jest.fn();
    const payload = {
      user: { id: 1 },
      actions: [{
        name: 'page_1',
        value: 'xxxx'
      }]
    };
    const trip = {
      origin: { address: '' },
      destination: { address: '' },
      requester: { slackId: 1, name: '' }
    };
    const trips = [trip];
    InteractivePrompts.sendUpcomingTrips(trips, 20, 10, response, payload);
    expect(response).toBeCalledTimes(1);
  });

  it('should send rider select list', () => {
    const response = jest.fn();
    InteractivePrompts.sendRiderSelectList({ channel: { id: 1 }, user: { id: 2 } }, response);
    expect(response).toBeCalledTimes(1);
  });

  it('should send list of departments', async () => {
    const response = jest.fn();
    SlackHelpers.getDepartments = jest.fn(() => 'attachment');
    SlackButtonsAttachmentFromAList.createAttachments = jest.fn(() => []);
    const props = {
      payload: { channel: { id: 1 }, user: { id: 2 } },
      respond: response,
      attachmentCallbackId: 'aata',
      navButtonCallbackId: 'atab',
      navButtonValue: 'io'
    };

    await InteractivePrompts.sendListOfDepartments(props);
    expect(response).toBeCalledTimes(1);
  });

  it('should send list of departments with forSelf as [false]', async () => {
    const response = jest.fn();
    SlackHelpers.getDepartments = jest.fn(() => 'attachment');
    SlackButtonsAttachmentFromAList.createAttachments = jest.fn(() => []);
    const props = {
      payload: { channel: { id: 1 }, user: { id: 2 } },
      respond: response,
      attachmentCallbackId: 'aata',
      navButtonCallbackId: 'atab',
      navButtonValue: 'io'
    };

    await InteractivePrompts.sendListOfDepartments(props, 'false');
    expect(response).toBeCalledTimes(1);
  });

  it('should send ops decline or approval', async (done) => {
    const tripInfo = {
      decliner: {
        dataValues: {
          slackId: 'XXXXXXX'
        }
      },
      rider: {
        dataValues: {

        }
      },
      origin: {
        dataValues: {

        }
      },
      destination: {
        dataValues: {

        }
      },
      requester: {
        dataValues: {

        }
      },
      department: {
        dataValues: {

        }
      },
      confirmer: {
        slackId: 'XXXXXXXXX'
      },
      cab: {
        dataValues: {
          driverName: 'Dave',
          driverPhoneNo: '2345678',
          regNumber: 'GE 890 DSX'
        }
      }
    };
    InteractivePrompts.messageUpdate = jest.fn(() => {});

    await InteractivePrompts.sendOpsDeclineOrApprovalCompletion(
      false, tripInfo, '3456787654.3456787654', 'DM45676543', 'just a token'
    );
    expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
    done();
  });
});

describe('test send Trip History', () => {
  it('should generate trip history', (done) => {
    const respond = jest.fn(value => value);
    const tripHistory = [
      {
        departureTime: '22:00 12/12/2018',
        'origin.address': 'ET',
        'destination.address': 'DOJO'
      }
    ];
    InteractivePrompts.sendTripHistory(tripHistory, respond);
    expect(respond).toHaveBeenCalledWith(tripHistoryMock);
    done();
  });
});

describe('test send add passenger response', () => {
  it('should provide an interface to add passengers', (done) => {
    const respond = jest.fn(value => value);
    InteractivePrompts.sendAddPassengersResponse(respond);
    expect(respond).toHaveBeenCalled();
    done();
  });
});

describe('test send add passenger response with forSelf as [false]', () => {
  it('should provide an interface to add passengers', (done) => {
    const respond = jest.fn(value => value);
    InteractivePrompts.sendAddPassengersResponse(respond, false);
    expect(respond).toHaveBeenCalled();
    done();
  });
});

describe('test send preview response and cancel response', () => {
  beforeEach(() => {
    InteractivePromptsHelpers.generatePreviewTripResponse = jest.fn(() => 'called');
  });

  it('should send preview response', () => {
    const respond = jest.fn(value => value);
    InteractivePrompts.sendPreviewTripResponse('trip', respond);
    expect(respond).toBeCalled();
  });
});

describe('LocationPrompts', () => {
  it('should sendLocationSuggestionResponse', () => {
    const respond = jest.fn(value => value);
    LocationPrompts.sendLocationSuggestionsResponse(
      respond,
      'https://staticMap',
      [{ text: 'Location1', value: 'place_id' }]
    );
    expect(respond).toBeCalled();
  });

  it('should sendLocationConfirmationResponse', () => {
    const respond = jest.fn(value => value);
    LocationPrompts.sendLocationConfirmationResponse(
      respond,
      'https://staticMap',
      'test location',
      '1,1'
    );
    expect(respond).toBeCalled();
  });

  it('should sendLocationCoordinatesNotFound', () => {
    const respond = jest.fn(value => value);
    LocationPrompts.sendLocationCoordinatesNotFound(respond);
    expect(respond).toBeCalled();
  });
});
