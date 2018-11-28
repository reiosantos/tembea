import InteractivePrompts from '../InteractivePrompts';
import {
  sendBookNewTripMock,
  sendCompletionResponseMock
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
});
