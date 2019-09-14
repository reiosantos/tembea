import RouteService from '../../../services/RouteService';
import RouteHelper from '../../../helpers/RouteHelper';
import ConfirmRouteUseJob from '../../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import RouteEventHandlers from '../route-event.handlers';
import { mockRouteBatchData } from '../../../services/__mocks__';
import RouteUseRecordService from '../../../services/RouteUseRecordService';
import { route, recordData } from '../../../helpers/__mocks__/BatchUseRecordMock';
import appEvents from '../app-event.service';
import { routeEvents } from '../route-events.constants';
import TeamDetailsService from '../../../services/TeamDetailsService';
import { bugsnagHelper } from '../../slack/RouteManagement/rootFile';

describe('RouteEventHandlers', () => {
  beforeEach(() => {

  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendTakeOffAlerts', () => {
    it('should send takeoff alerts to riders', async (done) => {
      jest.spyOn(RouteService, 'getRouteBatchByPk').mockReturnValue(mockRouteBatchData);
      jest.spyOn(RouteHelper, 'sendTakeOffReminder').mockReturnValue();
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
        .mockResolvedValue({ botToken: 'xoopsad' });
      jest.spyOn(ConfirmRouteUseJob, 'scheduleTripCompletionNotification').mockReturnValue();
      jest.spyOn(RouteUseRecordService, 'create').mockResolvedValue(recordData);
      await RouteEventHandlers.sendTakeOffAlerts({ batchId: 1 });
      expect(RouteService.getRouteBatchByPk).toHaveBeenCalled();
      expect(ConfirmRouteUseJob.scheduleTripCompletionNotification)
        .toHaveBeenCalledWith(expect.objectContaining({ recordId: recordData.id }));
      done();
    });

    it('should handle error when shit happens', async (done) => {
      const err = new Error('Shit happened');
      jest.spyOn(bugsnagHelper, 'log').mockImplementation();
      jest.spyOn(RouteService, 'getRouteBatchByPk')
        .mockRejectedValue(err);
      await RouteEventHandlers.sendTakeOffAlerts({ batchId: 0 });
      expect(bugsnagHelper.log).toHaveBeenCalledWith(err);
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
      await RouteEventHandlers.sendCompletionNotification({ batchId: 1 });
      expect(RouteUseRecordService.getByPk).toHaveBeenCalled();
      expect(RouteHelper.sendCompletionNotification).toHaveBeenCalled();
      done();
    });

    it('should do nothing when record details is incomplete', async (done) => {
      jest.spyOn(RouteUseRecordService, 'getByPk').mockReturnValue();
      jest.spyOn(RouteHelper, 'sendCompletionNotification');
      await RouteEventHandlers.sendCompletionNotification({
        recordId: 1, botToken: 'sadasd'
      });
      expect(RouteHelper.sendCompletionNotification).not.toHaveBeenCalled();
      done();
    });
  });

  describe('should registe subscribers', () => {
    it('should call the handler', (done) => {
      const testData = { batchId: 3 };
      jest.spyOn(RouteEventHandlers, 'sendTakeOffAlerts').mockResolvedValue();

      RouteEventHandlers.init();
      appEvents.broadcast({ name: routeEvents.takeOffAlert, data: testData });

      setTimeout(() => {
        expect(RouteEventHandlers.sendTakeOffAlerts).toHaveBeenCalledWith(testData);
        done();
      }, 3000);
    });
  });
});
