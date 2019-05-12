import Notifications from '../../../../SlackPrompts/Notifications';
import cache from '../../../../../../cache';
import LocationHelpers from '../../../../../../helpers/googleMaps/locationsMapHelpers';
import travelTripHelper from '../index';
import travelFunctions from '../travelHelper';

describe('travelTripHelper', () => {
  let payload;
  let respond;
  
  beforeEach(() => {
    cache.save = jest.fn(() => {});
    respond = jest.fn();
    cache.fetch = jest.fn((id) => {
      if (id === 1) {
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
      await travelFunctions.getPickupType({ pickup: 'Others' }, respond);
      expect(locationVerify).toHaveBeenCalledWith(
        { pickup: 'Others' }, 'pickup', 'travel_trip'
      );
    });

    it('Should call the location verify', async () => {
      const locationVerify = jest.spyOn(LocationHelpers,
        'locationVerify').mockImplementation(() => Promise.resolve(true));
      await travelFunctions.getDestinationType({ submission: { destination: 'Others' } }, respond);
      expect(locationVerify).toHaveBeenCalledWith(
        { destination: 'Others' }, 'destination', 'travel_trip'
      );
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
      travelResponce = jest.spyOn(travelFunctions, 'responseMessage');
      travelFunctions.validatePickupDestination(pickupData, respond);
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
      travelResponce = jest.spyOn(travelFunctions, 'responseMessage');
      travelFunctions.validatePickupDestination(destinationData, respond);
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
      await travelTripHelper.requesterToBeDecidedNotification(payload, respond);
      expect(respond).toHaveBeenCalled();

      payload = {
        user: { id: 1 }, actions: [{ name: '', value: 'not yay' }]
      };
      await travelTripHelper.requesterToBeDecidedNotification(payload, respond);
      expect(cache.fetch).toHaveBeenCalled();
      expect(respond).toHaveBeenCalled();
    });
  });

  describe('riderLocationConfirmation', () => {
    it('should call callRiderLocationConfirmation function', async () => {
      const callRiderLocationConfirmation = jest.spyOn(LocationHelpers,
        'callRiderLocationConfirmation').mockImplementation(() => Promise.resolve());

      await travelTripHelper.riderLocationConfirmation(payload, respond);
      expect(callRiderLocationConfirmation).toBeCalledWith(payload, respond, 'pickup');
      expect(respond).toHaveBeenCalled();

      payload.actions[0].value = 'cancel';
      await travelTripHelper.riderLocationConfirmation(payload, respond);
      expect(respond).toHaveBeenCalled();
    });
  });

  describe('OpsLocationConfirmation', () => {
    it('Should call cache functions and sendOperationsRiderlocationConfirmation', async () => {
      const sendOperationsRiderlocationConfirmation = jest.spyOn(Notifications,
        'sendOperationsRiderlocationConfirmation').mockImplementation(() => Promise.resolve());

      await travelTripHelper.OpsLocationConfirmation(payload, respond);
      expect(sendOperationsRiderlocationConfirmation).toHaveBeenCalled();
      expect(cache.fetch).toHaveBeenCalledTimes(2);
      expect(cache.save).toHaveBeenCalledTimes(1);
      expect(respond).toHaveBeenCalledTimes(1);
    });
  });
});