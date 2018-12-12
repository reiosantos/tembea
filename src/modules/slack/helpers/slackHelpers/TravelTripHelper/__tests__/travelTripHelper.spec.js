import travelTripHelper from '../travelTripHelper';
import ScheduleTripController from '../../../../TripManagement/ScheduleTripController';
import InteractivePrompts from '../../../../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../SlackPrompts/DialogPrompts';
import Cache from '../../../../../../cache';
import { SlackInteractiveMessage } from '../../../../SlackModels/SlackMessageModels';

const unsuccessfulResponse = new SlackInteractiveMessage(
  'Unsuccessful request. Kindly Try again'
);
jest.mock('../../../../events', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));
jest.mock('../../../../events/slackEvents', () => ({
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

describe('Travel Trip helper test', () => {
  let respond;

  beforeEach(() => {
    respond = jest.fn();
    Cache.save = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should test contact details handler and return error', async () => {
    ScheduleTripController.validateTravelContactDetailsForm = jest.fn(() => 'error');
    const result = await travelTripHelper.contactDetails('payload', respond);
    expect(result).toHaveProperty('errors', 'error');
  });

  it('should test contact details handler', async () => {
    ScheduleTripController.validateTravelContactDetailsForm = jest.fn(() => []);
    InteractivePrompts.sendListOfDepartments = jest.fn();
    const payload = { user: { id: 1 }, submission: 'submission' };
    await travelTripHelper.contactDetails(payload, respond);
    expect(Cache.save).toHaveBeenCalledWith(1, 'contactDetails', 'submission');
    expect(InteractivePrompts.sendListOfDepartments).toHaveBeenCalled();
  });

  it('should test contact details handler and catch error', async () => {
    InteractivePrompts.sendListOfDepartments = jest.fn();
    ScheduleTripController.validateTravelContactDetailsForm = jest.fn(() => []);
    await travelTripHelper.contactDetails('payload', respond);
    expect(respond).toHaveBeenCalledWith(unsuccessfulResponse);
  });

  it('should test department handler', () => {
    DialogPrompts.sendTravelTripDetailsForm = jest.fn();
    const payload = { user: { id: 1 }, actions: [{ value: 'boy', name: 'girl' }] };
    travelTripHelper.department(payload, respond);
    expect(Cache.save).toBeCalledTimes(2);
    expect(DialogPrompts.sendTravelTripDetailsForm).toHaveBeenCalledWith(payload, 'flightDetails');
  });

  it('should formatTrip details', () => {
    const cachedData = {
      departmentId: 1,
      departmentName: 'Go',
      contactDetails: {
        noOfPassengers: 23
      },
      tripType: 'Travel Trip'
    };
    const submission = { flightDateTime: '12/12/2018 11:00' };

    Cache.fetch = jest.fn(() => (cachedData));
    const result = travelTripHelper.formatTripDetails(1, submission);
    expect(result).toHaveProperty('dateTime', '12/12/2018 08:00');
    expect(result).toHaveProperty('reason', 'Airport Transfer');
    expect(result).toHaveProperty('noOfPassengers', 23);
  });

  it('should test flightDetails handler and return error', async () => {
    ScheduleTripController.validateTravelFlightDetailsForm = jest.fn(() => 'error');
    const payload = { user: { id: 1 }, submission: 'submission' };
    const result = await travelTripHelper.flightDetails(payload, respond);
    expect(result).toHaveProperty('errors', 'error');
  });

  it('should test flightDetails handler', async () => {
    ScheduleTripController.validateTravelFlightDetailsForm = jest.fn(() => []);
    InteractivePrompts.sendPreviewTripResponse = jest.fn();
    travelTripHelper.formatTripDetails = jest.fn(() => 'format');
    const payload = { user: { id: 1 }, submission: 'submission' };

    await travelTripHelper.flightDetails(payload, respond);
    expect(ScheduleTripController.validateTravelFlightDetailsForm).toHaveBeenCalledWith(payload);
    expect(travelTripHelper.formatTripDetails).toHaveBeenCalledWith(1, 'submission');
    expect(Cache.save).toHaveBeenCalledWith(1, 'tripDetails', 'format');
    expect(InteractivePrompts.sendPreviewTripResponse).toHaveBeenCalledWith('format', respond);
  });

  it('should test flightDetails handler', async () => {
    ScheduleTripController.validateTravelFlightDetailsForm = jest.fn(() => []);
    InteractivePrompts.sendPreviewTripResponse = jest.fn(() => { throw new Error('failed'); });
    travelTripHelper.formatTripDetails = jest.fn(() => 'format');
    const payload = { user: { id: 1 }, submission: 'submission' };

    await travelTripHelper.flightDetails(payload, respond);
    expect(respond).toBeCalled();
  });

  it('should test confirmation handler and return when action is cancel', () => {
    InteractivePrompts.sendCancelRequestResponse = jest.fn();
    ScheduleTripController.createTravelTripRequest = jest.fn();
    Cache.fetch = jest.fn(() => ({ tripDetails: 'trip' }));
    const payload = { user: { id: 1 }, actions: [{ value: 'cancel' }] };

    travelTripHelper.confirmation(payload, respond);
    expect(InteractivePrompts.sendCancelRequestResponse).toHaveBeenCalledWith(respond);
  });

  it('should test confirmation handler', () => {
    InteractivePrompts.sendCancelRequestResponse = jest.fn();
    ScheduleTripController.createTravelTripRequest = jest.fn();
    Cache.fetch = jest.fn(() => ({ tripDetails: 'trip' }));
    const payload = { user: { id: 1 }, actions: [{ value: 'go' }] };

    travelTripHelper.confirmation(payload, respond);
    expect(ScheduleTripController.createTravelTripRequest).toHaveBeenCalledWith(payload, respond, 'trip');
  });
});
