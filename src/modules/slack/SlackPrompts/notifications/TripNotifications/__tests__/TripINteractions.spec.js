import TripInteractions from '../TripInteractions';
import tripService from '../../../../../../services/TripService';
import * as SlackModels from '../../../../SlackModels/SlackMessageModels';
import TripCompletionJob from '../../../../../../services/jobScheduler/jobs/TripCompletionJob';
import DialogPrompts from '../../../DialogPrompts';

describe('TripInteractions', () => {
  describe('TripInteractions_tripCompleted', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should call TripInteractions.isOnTrip', async () => {
      jest.spyOn(TripInteractions, 'isOnTrip').mockReturnValue({});
      const payload = {
        actions: [{
          name: 'still_on_trip'
        }]
      };
      TripInteractions.tripCompleted(payload, {}, {});
      expect(TripInteractions.isOnTrip).toBeCalledTimes(1);
    });
    it('should break if no action', async () => {
      const payload = {
        actions: [{
          name: 'still_on_trip33'
        }]
      };
      TripInteractions.tripCompleted(payload, {}, {});
    });
    it('should call TripInteractions.hasNotTakenTrip', async () => {
      jest.spyOn(TripInteractions, 'hasNotTakenTrip').mockReturnValue({});
      const payload = {
        actions: [{
          name: 'not_taken'
        }]
      };
      TripInteractions.tripCompleted(payload, {}, {});
      expect(TripInteractions.hasNotTakenTrip).toBeCalledTimes(1);
    });
    it('should call TripInteractions.hasCompletedTrip', async () => {
      jest.spyOn(TripInteractions, 'hasCompletedTrip').mockReturnValue({});
      const payload = {
        actions: [{
          name: 'trip_taken'
        }]
      };
      TripInteractions.tripCompleted(payload, {}, {});
      expect(TripInteractions.hasCompletedTrip).toBeCalledTimes(1);
    });
  });
  describe('TripInteractions_hasTakenTrip', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should return a slack interactive message to ask whether trip has been taken',
      async () => {
        const payload = {
          actions: [{
            value: 3,
            name: 'still_on_trip'
          }]
        };
      
        const respond = jest.fn(() => {});
        jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});
        jest.spyOn(SlackModels, 'SlackInteractiveMessage').mockReturnValue({});
        jest.spyOn(TripCompletionJob, 'createScheduleForATrip').mockReturnValue({});
        await TripInteractions.isOnTrip(payload, respond);
        expect(tripService.updateRequest).toBeCalledTimes(1);
      });
  });
  describe('TripInteractions_hasCompletedTrip', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should return an interactive message once a trip had been completed',
      async () => {
        const payload = {
          actions: [{
            value: 2
          }]
        };
        const respond = jest.fn(() => {});
        jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});
        jest.spyOn(SlackModels, 'SlackInteractiveMessage').mockReturnValue({});
        await TripInteractions.hasCompletedTrip(payload, respond);

        expect(tripService.updateRequest).toBeCalledTimes(1);
        expect(respond).toBeCalled();
      });
  });

  describe('TripInteractions_hasNotTakenTrip', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should send a dialog prompt when a trip has not been taken', async () => {
      const payload = { actions: [{ value: 6 }] };
      const respond = jest.fn(() => {});

      jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});
      jest.spyOn(DialogPrompts, 'sendDialog').mockResolvedValue({});
      await TripInteractions.hasNotTakenTrip(payload, respond);

      expect(tripService.updateRequest).toBeCalledTimes(1);
      expect(tripService.updateRequest).toBeCalledWith(6, { tripStatus: 'Cancelled' });
    });
  });
  describe('TripInteractions_resonForNotTakingTrip', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should Return a slack interactive message after entering reason for not taking trip',
      async () => {
        const payload = {
          submission: { tripNotTakenReason: 'I arrived late' },
          state: 4
        };
        const respond = jest.fn(() => {});
        jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});
        jest.spyOn(SlackModels, 'SlackInteractiveMessage').mockReturnValue({});
        await TripInteractions.resonForNotTakingTrip(payload, respond);
  
        expect(respond).toBeCalled();
        expect(tripService.updateRequest).toBeCalledTimes(1);
        expect(tripService.updateRequest).toBeCalledWith(
          4, { tripNotTakenReason: 'I arrived late' }
        );
      });
  });
});
