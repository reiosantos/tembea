import JoinRouteInteractions from '../JoinRouteInteractions';
import RoutesHelpers from '../../../helpers/routesHelper';

describe('JoinRouteInputHandlers', () => {
  describe('JoinRouteController_sendAvailableRoutesMessage', () => {
    let respond;
    beforeEach(() => {
      respond = jest.fn();
      jest.spyOn(RoutesHelpers, 'toAvailableRoutesAttachment');
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
