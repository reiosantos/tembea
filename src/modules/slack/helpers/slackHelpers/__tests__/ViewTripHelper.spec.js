import tripService from '../../../../../services/TripService';
import ViewTripHelper from '../ViewTripHelper';
import { bugsnagHelper } from '../../../RouteManagement/rootFile';
import UserService from '../../../../../services/UserService';


describe('ViewTripHelper', () => {
  let tripData;
  let respond;
  let payload;
  let requestId;
  let tripRequest;
  let userName;
  beforeEach(() => {
    tripData = {
      noOfPassengers: 1,
      reason: 'going to the airport.',
      tripStatus: 'Pending',
      departureTime: '2019',
      tripType: 'Regular Trip',
      createdAt: 'Wed Feb',
      origin: { address: 'Villarosa Kempinski' },
      destination: { address: 'Bao Box Westlands' }
    };
    requestId = 12;
    payload = {
      user: {
        id: 1
      }
    };
    respond = jest.fn();
    tripRequest = jest.spyOn(tripService, 'getById').mockResolvedValue(tripData);
    userName = jest.spyOn(UserService, 'getUserById');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('displayTripRequest', () => {
    it('should display trip request', async (done) => {
      tripRequest.mockResolvedValueOnce({ ...tripData });
      userName.mockResolvedValue();
      const result = await ViewTripHelper.displayTripRequest(requestId, payload, respond);
      expect(tripRequest).toHaveBeenCalledTimes(1);
      expect(userName).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('attachments');
      expect(result).toHaveProperty('text');
      expect(result.response_type).toBe('ephemeral');
      done();
    });

    it('should handle errors', async (done) => {
      tripRequest.mockRejectedValue(new Error('failing'));
      jest.spyOn(bugsnagHelper, 'log');
      const result = await ViewTripHelper.displayTripRequest(requestId, payload, respond);
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(result.text).toBe('Request unsuccessfull.:cry:');
      done();
    });
  });

  describe('tripAttachment', () => {
    it('should create an attachment', () => {
      const SlackId = 'ERER45';
      const greeting = `Hey, <@${SlackId}> below is your trip request details :smiley:`;
      jest.spyOn(ViewTripHelper, 'tripAttachmentFields').mockReturnValue();
      const result = ViewTripHelper.tripAttachment(tripData, SlackId);
      expect(ViewTripHelper.tripAttachmentFields).toHaveBeenCalled();
      expect(result).toHaveProperty('attachments');
      expect(result.text).toBe(greeting);
    });

    it('should create an attachment', () => {
      const result = ViewTripHelper.tripAttachmentFields(tripData);
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(10);
      expect(result[0].value).toBe('Villarosa Kempinski');
      expect(result[1].value).toBe('Bao Box Westlands');
    });
  });
});
