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
  });
  describe('autoStartRouteJob', () => {
    it('should autoStartRouteJob successfully', async () => {
      jest.spyOn(scheduler, 'scheduleJob').mockImplementation((rule, fn) => {
        fn();
        jest.spyOn(RouteService, 'getRoutes');
      });
      jest.spyOn(RouteService, 'getRoutes').mockResolvedValue({ routes: [{}, {}] });
      jest.spyOn(ConfirmRouteUseJob, 'scheduleBatchStartJob');
      await ConfirmRouteUseJob.autoStartRouteJob();
      expect(scheduler.scheduleJob).toBeCalledTimes(1);
    });
  });
  describe('scheduleBatchStartJob', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should scheduleBatchStartJob successfully', async () => {
      jest.spyOn(scheduler, 'scheduleJob').mockImplementation((rule, fn) => {
        fn();
        jest.spyOn(BatchUseRecordService, 'getBatchUseRecord').mockResolvedValue({ data: [{}] });
      });
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
});
