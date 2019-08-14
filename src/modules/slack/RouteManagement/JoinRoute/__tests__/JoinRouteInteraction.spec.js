import JoinRouteInteractions from '../JoinRouteInteractions';
import SequelizePaginationHelper from '../../../../../helpers/sequelizePaginationHelper';
import RouteService from '../../../../../services/RouteService';
import RoutesHelpers from '../../../helpers/routesHelper';
import JoinRouteInputHandlers from '../JoinRouteInputHandler';
import mockPayload from '../../__mocks__/payload.mock';
import BatchUseRecordService from '../../../../../services/BatchUseRecordService';
import ConfirmRouteUseJob from '../../../../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import UserService from '../../../../../services/UserService';
import routeBatchMock from '../__mocks__/routeBatch.mock';

describe('Test JointRouteInteractions', () => {
  const res = jest.fn();
  describe('Test sendAvailableRoutesMessage', () => {
    beforeEach(() => {
      jest
        .spyOn(SequelizePaginationHelper, 'deserializeSort')
        .mockReturnValue(['asc', 'name']);
      jest
        .spyOn(RouteService, 'getRoutes')
        .mockReturnValue({ routes: [{}], totalPages: 1, pageNo: 1 });
      jest
        .spyOn(RoutesHelpers, 'toAvailableRoutesAttachment')
        .mockReturnValue('');
    });

    it('should test sendAvailableRoutesMessage', async () => {
      await JoinRouteInteractions.sendAvailableRoutesMessage(1, res);

      expect(RoutesHelpers.toAvailableRoutesAttachment).toBeCalled();
      expect(RouteService.getRoutes).toBeCalled();
    });

    it('should skip page', async () => {
      const actions = [{ name: 'skipPage', field: 'field' }];
      const payload = { actions, team: { id: 3 } };

      const result = await JoinRouteInteractions.sendAvailableRoutesMessage(
        payload,
        res
      );
      expect(result).toBe(undefined);
      expect(RoutesHelpers.toAvailableRoutesAttachment).toBeCalled();
      expect(RouteService.getRoutes).toBeCalled();
    });
  });
  describe('Test handleSendAvailableRoutesActions', () => {
    let respond;
    let payload;
    let mockFn;
    beforeEach(() => {
      respond = jest.fn();
      mockFn = jest.spyOn(JoinRouteInteractions, 'sendAvailableRoutesMessage').mockResolvedValue();
    });

    afterEach(() => {
      mockFn.mockRestore();
    });

    it('should call sendAvailableRoutesMessage for "See Available Routes"', async () => {
      payload = mockPayload('value', 'See Available Routes');
      await JoinRouteInteractions.handleSendAvailableRoutesActions(payload, respond);
      expect(JoinRouteInteractions.sendAvailableRoutesMessage).toHaveBeenCalledTimes(1);
      expect(JoinRouteInteractions.sendAvailableRoutesMessage).toHaveBeenCalledWith(payload, respond);
    });

    it('should call sendAvailableRoutesMessage for action names starting with "page_"', async () => {
      payload = mockPayload('value', 'page_3');
      await JoinRouteInteractions.handleSendAvailableRoutesActions(payload, respond);
      expect(JoinRouteInteractions.sendAvailableRoutesMessage).toHaveBeenCalledTimes(1);
      expect(JoinRouteInteractions.sendAvailableRoutesMessage).toHaveBeenCalledWith(payload, respond);
    });
  });
  describe('Test handleViewAvailableRoutes', () => {
    let respond;
    let payload;
    beforeEach(() => {
      respond = jest.fn();
      jest.spyOn(JoinRouteInteractions, 'sendAvailableRoutesMessage').mockResolvedValue();
      jest.spyOn(JoinRouteInteractions, 'handleSendAvailableRoutesActions').mockResolvedValue();
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should call handleSendAvailableRoutesActions for interactive message', async () => {
      payload = { type: 'interactive_message' };
      await JoinRouteInteractions.handleViewAvailableRoutes(payload, respond);
      expect(JoinRouteInteractions.handleSendAvailableRoutesActions).toHaveBeenCalledTimes(1);
      expect(JoinRouteInteractions.handleSendAvailableRoutesActions).toHaveBeenCalledWith(payload, respond);
    });

    it('should call sendAvailableRoutesMessage for dialog submission', async () => {
      payload = { type: 'dialog_submission' };
      await JoinRouteInteractions.handleViewAvailableRoutes(payload, respond);
      expect(JoinRouteInteractions.sendAvailableRoutesMessage).toHaveBeenCalledTimes(1);
      expect(JoinRouteInteractions.sendAvailableRoutesMessage).toHaveBeenCalledWith(payload, respond);
    });
  });

  describe('Test full capacity', () => {
    it('should test fullRouteCapacityNotice', () => {
      const result = JoinRouteInteractions.fullRouteCapacityNotice('state');
      expect(result).toHaveProperty('attachments');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('as_user');
    });
  });

  describe('Test handleJoinRouteActions', () => {
    const respond = jest.fn();

    it('should test handleJoinRouteActions for wrong payload', () => {
      const actions = 'callAction';
      const payload = { actions, callBack_id: 'callId' };
      JoinRouteInteractions.handleJoinRouteActions(payload, respond);
      expect(respond).toBeCalled();
    });

    it('should throw an error if something goes wrong', () => {
      jest
        .spyOn(JoinRouteInputHandlers, 'joinRoute')
        .mockRejectedValue(new Error('something wrong'));
      const actions = 'callAction';
      const payload = { actions, callback_id: 'join_Route_joinRoute' };
      expect(
        JoinRouteInteractions.handleJoinRouteActions(payload, respond)
      ).rejects.toThrow('something wrong');
    });
  });

  describe('Test handleRouteBatchConfirmUse', () => {
    const respond = jest.fn();
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should test taken route button', async () => {
      const payload = { actions: [{ name: 'taken', value: '211' }], team: { id: 233 } };
      jest
        .spyOn(BatchUseRecordService, 'updateBatchUseRecord').mockResolvedValue();
      await JoinRouteInteractions.handleRouteBatchConfirmUse(payload, respond);
      expect(BatchUseRecordService.updateBatchUseRecord).toBeCalledTimes(1);
    });

    it('should test not taken route button', async () => {
      const payload = { actions: [{ name: 'not_taken', value: '211' }], team: { id: 343 } };
      jest.spyOn(JoinRouteInteractions, 'hasNotTakenTrip').mockResolvedValue();
      jest.spyOn(BatchUseRecordService, 'updateBatchUseRecord').mockResolvedValue();
      await JoinRouteInteractions.handleRouteBatchConfirmUse(payload, respond);
      expect(BatchUseRecordService.updateBatchUseRecord).toBeCalledTimes(1);
      expect(JoinRouteInteractions.hasNotTakenTrip).toBeCalledTimes(1);
    });

    it('should test still on trip route button', async () => {
      const payload = {
        actions: [{
          name: 'still_on_trip',
          value: '211'
        }],
        team: {
          id: 343
        }
      };
      jest.spyOn(BatchUseRecordService, 'updateBatchUseRecord');
      await JoinRouteInteractions.handleRouteBatchConfirmUse(payload, respond);
      expect(BatchUseRecordService.updateBatchUseRecord).toBeCalledTimes(1);
    });
    it('should add 30 minutes on production', async () => {
      jest.spyOn(ConfirmRouteUseJob, 'scheduleTripCompletionNotification');
      process.env.NODE_ENV = 'production';
      const payload = {
        actions: [{
          name: 'still_on_trip',
          value: '211'
        }],
        team: {
          id: 343
        }
      };
      await JoinRouteInteractions.handleRouteBatchConfirmUse(payload, respond);
      expect(ConfirmRouteUseJob.scheduleTripCompletionNotification).toHaveBeenCalled();
    });
  });

  describe('Test handleRouteSkipped', () => {
    const respond = jest.fn();
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should test handleRouteSkipped', async () => {
      const payload = { submission: { submission: 'teamId' }, state: 233 };
      jest
        .spyOn(BatchUseRecordService, 'updateBatchUseRecord').mockResolvedValue();
      await JoinRouteInteractions.handleRouteSkipped(payload, respond);
      expect(BatchUseRecordService.updateBatchUseRecord).toBeCalledTimes(1);
    });
  });

  describe('Test hasNotTakenTrip', () => {
    const respond = jest.fn();
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should test hasNotTakenTrip', async () => {
      const payload = { actions: [{ name: 'taken', value: '211' }], team: { id: 233 } };
      jest
        .spyOn(BatchUseRecordService, 'updateBatchUseRecord').mockResolvedValue();
      await JoinRouteInteractions.hasNotTakenTrip(payload, respond);
      expect(respond).toBeCalledTimes(1);
    });
  });

  describe('sendCurrentRouteMessage', () => {
    it('should send users current route', async () => {
      const [payload, respond, testBatchId] = [{ user: { id: 'U1234' } }, jest.fn(), routeBatchMock.routeBatchId];
      const getUserSpy = jest.spyOn(UserService, 'getUserBySlackId').mockImplementation(slackId => (
        {
          slackId,
          routeBatchId: testBatchId
        }));
      const getBatchSpy = jest.spyOn(RouteService, 'getRouteBatchByPk').mockImplementation(id => ({
        ...routeBatchMock,
        id
      }));

      await JoinRouteInteractions.sendCurrentRouteMessage(payload, respond);

      expect(getUserSpy).toHaveBeenCalledWith(payload.user.id);
      expect(getBatchSpy).toHaveBeenCalledWith(testBatchId, true);
    });
  });

  it('should display a message when the user has no route', async () => {
    const [payload, respond] = [{ user: { id: 'U1234' } }, jest.fn()];
    const getUserSpy = jest.spyOn(UserService, 'getUserBySlackId').mockImplementation(slackId => (
      {
        slackId,
        routeBatchId: null
      }));
    const getBatchSpy = jest
      .spyOn(RouteService, 'getRouteBatchByPk')
      .mockImplementation(() => null);

    await JoinRouteInteractions.sendCurrentRouteMessage(payload, respond);

    expect(getUserSpy).toHaveBeenCalledWith(payload.user.id);
    expect(getBatchSpy).toHaveBeenCalledWith(null, true);
  });
});
