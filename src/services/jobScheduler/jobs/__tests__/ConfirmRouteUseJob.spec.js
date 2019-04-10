import scheduler from 'node-schedule';
import ConfirmRouteUseJob from '../ConfirmRouteUseJob';
import RouteService from '../../../RouteService';
import RouteUseRecordService from '../../../RouteUseRecordService';
import { SlackEvents } from '../../../../modules/slack/events/slackEvents';
import BatchUseRecordService from '../../../BatchUseRecordService';


describe('ConfirmRouteUseJob', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    scheduler.scheduledJobs = { 'batch job 1': {}, 'batch job 2': {} };
    jest.spyOn(scheduler, 'scheduleJob').mockImplementation((start, rule, fn) => {
      fn();
      jest.spyOn(RouteService, 'getRoutes');
    });
  });
  describe('autoStartRouteJob', () => {
    it('should autoStartRouteJob successfully', async () => {
      jest.spyOn(RouteService, 'getRoutes').mockResolvedValue({ routes: [{}, {}] });
      jest.spyOn(ConfirmRouteUseJob, 'scheduleBatchStartJob');
      jest.spyOn(ConfirmRouteUseJob, 'scheduleAllRoutes').mockImplementation();
      await ConfirmRouteUseJob.autoStartRouteJob();
      expect(scheduler.scheduleJob).toBeCalledTimes(2);
    });
  });
  describe('scheduleBatchStartJob', () => {
    it('should scheduleBatchStartJob successfully', async () => {
      jest.spyOn(BatchUseRecordService, 'getBatchUseRecord').mockResolvedValue({ data: [{}] });
      jest.spyOn(ConfirmRouteUseJob, 'confirmRouteBatchUseNotification').mockResolvedValue({ data: [{}] });
      jest.spyOn(RouteUseRecordService, 'createRouteUseRecord')
        .mockResolvedValue({ batchRecordId: 1, takeOff: '10:00', id: 4 });

      jest.spyOn(RouteService, 'getRoutes').mockResolvedValue({ routes: [{}, {}] });
      jest.spyOn(ConfirmRouteUseJob, 'scheduleBatchStartJob');
      await ConfirmRouteUseJob.scheduleBatchStartJob({ id: 4 });
      expect(scheduler.scheduleJob).toBeCalledTimes(1);
    });
  });
  describe('confirmRouteBatchUseNotification', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should confirmRouteBatchUseNotification successfully', async () => {
      jest.spyOn(SlackEvents, 'raise');
      jest.spyOn(ConfirmRouteUseJob, 'scheduleBatchStartJob');
      await ConfirmRouteUseJob.confirmRouteBatchUseNotification({ id: 4 });
      expect(SlackEvents.raise).toBeCalledTimes(1);
    });
  });
  describe('scheduleAllRoutes', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should confirmRouteBatchUseNotification successfully', async () => {
      jest.spyOn(RouteService, 'getRoutes').mockImplementation(() => ({ routes: [{}] }));
      jest.spyOn(ConfirmRouteUseJob, 'scheduleBatchStartJob').mockImplementation();
      await ConfirmRouteUseJob.scheduleAllRoutes();
      expect(ConfirmRouteUseJob.scheduleBatchStartJob).toBeCalledTimes(1);
    });
  });
});
