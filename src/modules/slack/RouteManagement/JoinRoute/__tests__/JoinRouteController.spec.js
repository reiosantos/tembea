import JoinRouteInteractions from '../JoinRouteInteractions';
import RoutesHelpers from '../../../helpers/routesHelper';
import RouteService from '../../../../../services/RouteService';

describe('JoinRouteInputHandlers', () => {
  describe('JoinRouteController_sendAvailableRoutesMessage', () => {
    const mockRoutesData = {
      routes: [],
      totalPages: 1,
      pageNo: 1
    };

    let respond;
    beforeEach(() => {
      respond = jest.fn();
      jest.spyOn(RoutesHelpers, 'toAvailableRoutesAttachment');
      jest.spyOn(RouteService, 'getRoutes').mockResolvedValue(mockRoutesData);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should display all routes', async () => {
      const payload = {};
      await JoinRouteInteractions.sendAvailableRoutesMessage(payload, respond);
      expect(RoutesHelpers.toAvailableRoutesAttachment).toBeCalled();
    });
  });
});
