import JoinRouteInteractions from '../JoinRouteInteractions';
import SequelizePaginationHelper from '../../../../../helpers/sequelizePaginationHelper';
import RouteService from '../../../../../services/RouteService';
import RoutesHelpers from '../../../helpers/routesHelper';
import JoinRouteInputHandlers from '../JoinRouteInputHandler';

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
      const payload = { actions };

      const result = await JoinRouteInteractions.sendAvailableRoutesMessage(
        payload,
        res
      );
      expect(result).toBe(undefined);
      expect(RoutesHelpers.toAvailableRoutesAttachment).toBeCalled();
      expect(RouteService.getRoutes).toBeCalled();
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
});
