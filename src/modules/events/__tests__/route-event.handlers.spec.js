import RouteService from '../../../services/RouteService';
import RouteHelper from '../../../helpers/RouteHelper';
import ConfirmRouteUseJob from '../../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import RouteEventHandlers from '../route-event.handlers';
import { mockRouteBatchData } from '../../../services/__mocks__';
import RouteUseRecordService from '../../../services/RouteUseRecordService';
import { route, recordData } from '../../../helpers/__mocks__/BatchUseRecordMock';

describe('RouteEventHandlers', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('RouteEventsHandlers', () => {
    it('should initalize and create subscriptions', async (done) => {
      const routeEventHandler = new RouteEventHandlers();
      expect(routeEventHandler.subscriptions.length).toBeGreaterThan(0);
      done();
    });
  });

  describe('sendTakeOffAlerts', () => {
    it('should send takeoff alerts to riders', async (done) => {
      jest.spyOn(RouteService, 'getRouteBatchByPk').mockReturnValue(mockRouteBatchData);
      jest.spyOn(RouteHelper, 'sendTakeOffReminder').mockReturnValue('');
      jest.spyOn(ConfirmRouteUseJob, 'scheduleTripCompletionNotification').mockResolvedValue({});
      jest.spyOn(RouteUseRecordService, 'create').mockResolvedValue(recordData);
      await RouteEventHandlers.sendTakeOffAlerts({ batchId: 1 });
      expect(RouteService.getRouteBatchByPk).toHaveBeenCalled();
      expect(ConfirmRouteUseJob.scheduleTripCompletionNotification).toHaveBeenCalled();
      done();
    });
  });

  describe('sendCompletionNotification', () => {
    it('should send trip completion notification to rider', async (done) => {
      route.batch.riders = [{
        id: 1107,
        name: 'Test User',
        slackId: '3244ffeef-d3a8-43a4-8483-df81eda7e0a4',
        email: 'testUser@gmail.com',
        routeBatchId: 1025
      }];

      jest.spyOn(RouteUseRecordService, 'getByPk').mockReturnValue(route);
      jest.spyOn(RouteHelper, 'sendCompletionNotification').mockReturnValue('');
      await RouteEventHandlers.sendCompletionNotification(
        { batchId: 1, slackBotOauthToken: 'xoop-csdss' }
      );
      expect(RouteUseRecordService.getByPk).toHaveBeenCalled();
      expect(RouteHelper.sendCompletionNotification).toHaveBeenCalled();
      done();
    });
  });
});
