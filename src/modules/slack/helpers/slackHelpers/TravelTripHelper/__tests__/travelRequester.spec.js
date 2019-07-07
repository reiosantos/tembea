import Notifications from '../../../../SlackPrompts/Notifications';
import cache from '../../../../../../cache';
import LocationHelpers from '../../../../../../helpers/googleMaps/locationsMapHelpers';
import TravelTripHelper from '../index';
import ScheduleTripController from '../../../../TripManagement/ScheduleTripController';
import BugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import travelHelper from '../travelHelper';

describe('TravelTripHelper', () => {
  let payload;
  let respond;

  beforeEach(() => {
    cache.save = jest.fn(() => {});
    respond = jest.fn();
    cache.fetch = jest.fn((id) => {
      if (id === 'TRAVEL_REQUEST_1') {
        return {
          tripType: 'Airport Transfer',
          departmentId: '',
          departmentName: '',
          contactDetails: '',
          tripDetails: {
            destination: 'home',
            pickup: 'To Be Decided',
            rider: 1
          },
          waitingRequester: 1
        };
      }
      return {};
    });
    payload = {
      user: { id: 1 },
      submission: {},
      actions: [{ name: '', value: 'pickup_travelBtn' }],
      team: { id: 'TEAMID1' }
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });


  describe('getPickupType && getDestinationType', () => {
    it('Should call the location verify', async () => {
      const locationVerify = jest.spyOn(LocationHelpers,
        'locationVerify').mockImplementation(() => Promise.resolve());
      await travelHelper.getPickupType({ pickup: 'Others' }, respond);
      expect(locationVerify).toHaveBeenCalledWith(
        { pickup: 'Others' }, 'pickup', 'travel_trip'
      );
    });

    it('Should call the location verify', async () => {
      const locationVerify = jest.spyOn(LocationHelpers,
        'locationVerify').mockImplementation(() => Promise.resolve(true));
      await travelHelper.getDestinationType({ submission: { destination: 'Others' } }, respond);
      expect(locationVerify).toHaveBeenCalledWith(
        { destination: 'Others' }, 'destination', 'travel_trip'
      );
      expect(respond).toHaveBeenCalled();
    });

    it('Should thrown an error', async () => {
      jest.spyOn(BugsnagHelper, 'log');
      await travelHelper.getDestinationType({ submission: { destination: 'Others' } }, respond);
      await travelHelper.detailsConfirmation({ submission: { destination: 'Others' } }, respond);
      expect(respond).toHaveBeenCalled();
    });
  });

  describe('validatePickupDestination', () => {
    let locationValidator;
    let travelResponce;

    it('should call sendRiderlocationConfirmNotification', async () => {
      const pickupData = {
        pickup: 'To Be Decided', teamID: '12345', userID: 'QWE7654T', rider: 'QW875TY'
      };
      const newData = {
        location: 'pickup', teamID: '12345', userID: 'QWE7654T', rider: 'QW875TY'
      };
      locationValidator = jest.spyOn(Notifications,
        'sendRiderlocationConfirmNotification').mockImplementation(() => Promise.resolve());
      travelResponce = jest.spyOn(travelHelper, 'responseMessage');
      travelHelper.validatePickupDestination(pickupData, respond);
      expect(locationValidator).toHaveBeenCalledWith(newData, respond);
      expect(travelResponce).toHaveBeenCalled();
      expect(respond).toHaveBeenCalled();
    });

    it('Should return destinatioin focused data', () => {
      const destinationData = {
        pickup: 'Andela Dojo', teamID: '12345', userID: 'QWE7654T', rider: 'QW875TY'
      };
      const newDestinationData = {
        location: 'destination', teamID: '12345', userID: 'QWE7654T', rider: 'QW875TY'
      };
      locationValidator = jest.spyOn(Notifications,
        'sendRiderlocationConfirmNotification').mockImplementation(() => Promise.resolve());
      travelResponce = jest.spyOn(travelHelper, 'responseMessage');
      travelHelper.validatePickupDestination(destinationData, respond);
      expect(locationValidator).toHaveBeenCalledWith(newDestinationData, respond);
      expect(travelResponce).toHaveBeenCalled();
      expect(respond).toHaveBeenCalled();
    });
  });

  describe('requesterToBeDecidedNotification', () => {
    it('Should call fetch & respond', async () => {
      payload = {
        user: { id: 1 }, actions: [{ name: '', value: 'yay' }]
      };
      await TravelTripHelper.requesterToBeDecidedNotification(payload, respond);
      expect(respond).toHaveBeenCalled();

      payload = {
        user: { id: 1 }, actions: [{ name: '', value: 'not yay' }]
      };
      await TravelTripHelper.requesterToBeDecidedNotification(payload, respond);
      expect(cache.fetch).toHaveBeenCalled();
      expect(respond).toHaveBeenCalled();
    });
  });

  describe('riderLocationConfirmation', () => {
    it('should call callRiderLocationConfirmation function', async () => {
      const callRiderLocationConfirmation = jest.spyOn(LocationHelpers,
        'callRiderLocationConfirmation').mockImplementation(() => Promise.resolve());

      await travelHelper.riderLocationConfirmation(payload, respond);
      expect(callRiderLocationConfirmation).toBeCalledWith(payload, respond, 'pickup');
      expect(respond).toHaveBeenCalled();

      payload.actions[0].value = 'cancel';
      await travelHelper.riderLocationConfirmation(payload, respond);
      expect(respond).toHaveBeenCalled();
    });
  });
  describe('completeTravelConfirmation', () => {
    it('Should call sendOperationsRiderlocationConfirmation', async () => {
      const scheduleTripControllerSpy = jest.spyOn(
        ScheduleTripController, 'createTravelTripRequest'
      ).mockImplementation(() => Promise.resolve());
      const sendOpsRiderlocationConfirmationSpy = jest.spyOn(
        Notifications, 'sendOperationsRiderlocationConfirmation'
      ).mockImplementation(() => Promise.resolve());
      const sendResponseToOpsSpy = jest.spyOn(
        TravelTripHelper, 'sendCompletedResponseToOps'
      ).mockImplementation(() => Promise.resolve());

      await TravelTripHelper.completeTravelConfirmation(payload, respond);
      expect(scheduleTripControllerSpy).toHaveBeenCalled();
      expect(sendResponseToOpsSpy).toHaveBeenCalled();
      expect(sendOpsRiderlocationConfirmationSpy).toHaveBeenCalled();
    });
    it('Should capture errors', async () => {
      cache.save = jest.fn().mockImplementation(() => {
        throw new Error('Dummy error');
      });
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      await TravelTripHelper.completeTravelConfirmation(payload, respond);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });
  });
});
