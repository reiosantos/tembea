import InteractivePrompts from '../InteractivePrompts';
import {
  sendBookNewTripMock,
  sendCompletionResponseMock,
  tripHistoryMock
} from '../__mocks__/InteractivePrompts.mock';

jest.mock('../../../../utils/WebClientSingleton');

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
    const result = InteractivePrompts.sendDeclineCompletion(tripInitial, 'timeStamp', 1);
    expect(result).toBe(undefined);

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
    const trip = {
      origin: { address: '' },
      destination: { address: '' },
      requester: { slackId: 1, name: '' }
    };
    const trips = [trip];
    InteractivePrompts.sendUpcomingTrips(trips, response, { user: { id: 1 } });
    expect(response).toBeCalledTimes(1);
  });

  it('should send rider select list', () => {
    const response = jest.fn();
    InteractivePrompts.sendRiderSelectList({ channel: { id: 1 }, user: { id: 2 } }, response);
    expect(response).toBeCalledTimes(1);
  });

  it('should send list of departments', async () => {
    const response = jest.fn();
    await InteractivePrompts.sendListOfDepartments({ channel: { id: 1 }, user: { id: 2 } }, response);
    expect(response).toBeCalledTimes(1);
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
