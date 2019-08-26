import scheduler from 'node-schedule';
import moment from 'moment';
import ConfirmRouteUseJob from '../ConfirmRouteUseJob';
import RouteService from '../../../RouteService';
import RouteUseRecordService from '../../../RouteUseRecordService';
import appEvents from '../../../../modules/events/app-event.service';

const dummyBatches = [
  {
    id: 1,
    capacity: 3,
    takeOff: '05:30'
  },
  {
    id: 2,
    capacity: 4,
    takeOff: '06:00'
  }];

const toggleEnvironment = (env) => {
  process.env.NODE_ENV = process.env.NODE_ENV === 'test' ? env : 'test';
};

const env = 'production';

describe('ConfirmRouteUseJob', () => {
  beforeEach(() => {
    jest.spyOn(RouteService, 'getBatches').mockResolvedValue(dummyBatches);
    scheduler.scheduledJobs = { 'batch job 1': {}, 'batch job 2': {} };
    jest.spyOn(scheduler, 'scheduleJob').mockImplementation((name, rule, fn) => {
      scheduler.scheduledJobs[name] = new scheduler.Job(name, fn);
      fn();
    });
    jest.spyOn(appEvents, 'broadcast').mockReturnValue();
    jest.spyOn(RouteUseRecordService, 'create').mockImplementation((batchId) => (
      Promise.resolve({
        id: batchId + 100,
        batchId,
        batchUseDate: moment.utc().toISOString()
      })));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('autoStartRouteJob', () => {
    it('should start all notification jobs successfully', async (done) => {
      await ConfirmRouteUseJob.autoStartRouteJob();
      expect(scheduler.scheduleJob).toBeCalled();
      expect(scheduler.scheduleJob).toBeCalledWith('start', expect.anything(), expect.anything());
      done();
    });
  });

  describe('start', () => {
    let preNotificationSpy;

    beforeEach(() => {
      preNotificationSpy = jest.spyOn(ConfirmRouteUseJob, 'schedulePreTripNotification')
        .mockResolvedValue();
      jest.spyOn(ConfirmRouteUseJob, 'schedulePreTripNotification').mockReturnValue();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });

    it('should start the scheduler', async () => {
      await ConfirmRouteUseJob.start();

      expect(preNotificationSpy).toHaveBeenCalledTimes(1);
      expect(scheduler.scheduleJob).toHaveBeenCalledWith(expect.any(String),
        expect.any(scheduler.RecurrenceRule), expect.any(Function));
    });

    it('should adjust time based on environment', async () => {
      toggleEnvironment(env);
      await ConfirmRouteUseJob.start();

      expect(preNotificationSpy).toHaveBeenCalledTimes(1);
      expect(scheduler.scheduleJob).toHaveBeenCalledWith(expect.any(String),
        expect.any(scheduler.RecurrenceRule), expect.any(Function));
      toggleEnvironment(env);
    });
  });

  describe('schedulePreTripNotification', () => {
    it('should send pre-trip notification successfully', async (done) => {
      jest.spyOn(ConfirmRouteUseJob, 'scheduleTakeOffReminders')
        .mockResolvedValue();

      await ConfirmRouteUseJob.schedulePreTripNotification();
      expect(ConfirmRouteUseJob.scheduleTakeOffReminders)
        .toHaveBeenCalledTimes(dummyBatches.length);
      done();
    });
  });

  describe('scheduleTakeOffReminders', () => {
    const theTest = async () => {
      const testBatch = { id: 3 };

      await ConfirmRouteUseJob.scheduleTakeOffReminders(testBatch);
      // expect(appEvents.broadcast).toHaveBeenCalled();
    };

    it('should send a reminder message to the user before trip', async (done) => {
      await theTest();
      done();
    });

    it('should toggle time based on environment', async (done) => {
      toggleEnvironment(env);
      await theTest();
      toggleEnvironment(env);
      done();
    });
  });

  describe('scheduleTripCompleteNotifications', () => {
    const theTest = async (allowance) => {
      const testDummy = { takeOff: '06:00', recordId: 2, botToken: 'token' };
      await ConfirmRouteUseJob.scheduleTripCompletionNotification(testDummy);

      expect(scheduler.scheduleJob).toHaveBeenCalledWith(
        expect.stringContaining(testDummy.recordId.toString()),
        ConfirmRouteUseJob.getTodayTime(testDummy.takeOff,
          allowance),
        expect.any(Function)
      );
      expect(appEvents.broadcast)
        .toHaveBeenCalled();
    };

    it('should send post-trip notifications successfully', async (done) => {
      await theTest({ minutes: 1 });
      done();
    });

    it('should send post-trip notifications successfully', async (done) => {
      toggleEnvironment(env);
      await theTest({ hours: 2 });
      toggleEnvironment(env);
      done();
    });
  });
});
