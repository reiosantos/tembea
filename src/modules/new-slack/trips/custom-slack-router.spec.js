import CustomSlackRouter from './custom-slack-router';
import userTripActions from './user/actions';
import userTripBlocks from './user/blocks';
import UserTripBookingController from './user/user-trip-booking-controller';

describe('CustomSlackRouter', () => {
  const [payload, res] = [{
    actions: [{
      action_id: userTripActions.forMe,
      block_id: userTripBlocks.start
    }],
    submission: {
      dateTime: '22/12/2019 10:55',
      pickup: 'Somewhere on Earth'
    },
    user: {
      // tz_offset: 3600,
      id: 'UIS233'
    },
    team: { id: 'UIS233' },
    response_url: 'http://url.com'
  }, jest.fn()];

  const handler = new CustomSlackRouter();
  const route = {
    route: { actionId: userTripActions.forMe, blockId: userTripBlocks.start },
    handler: UserTripBookingController.forMe
  };
  handler.use(route.route, route.handler);

  const handlerMock = jest.fn();

  it('should handle a slack route', () => {
    jest.spyOn(handler.routes, 'get').mockReturnValue(handlerMock);
    jest.spyOn(UserTripBookingController, 'forMe');
    handler.handle(payload, res);
    expect(handler.routes.get).toHaveBeenCalled();
    expect(handlerMock).toHaveBeenCalledWith(payload, res);
  });

  it('should handle a slack route with next as argument', () => {
    const nextMock = jest.fn();
    jest.spyOn(handler.routes, 'get').mockReturnValue(undefined);
    handler.handle(payload, res, nextMock);
    expect(nextMock).toHaveBeenCalled();
  });

  it('should get the key when the action id is not necessary for the route', () => {
    const newPayload = {
      ...payload,
      actions: [{
        action_id: userTripActions.selectDestinationLocation,
        block_id: userTripBlocks.confirmLocation
      }]
    };
    const key = CustomSlackRouter.getKey(newPayload);
    expect(key).toBeDefined();
    expect(key).toEqual('__user_trip_confirm_location__action');
  });

  it('should createKey when actionId and blockId are not provided', () => {
    const key = CustomSlackRouter.createKey();
    expect(key).toBeDefined();
    expect(key).toEqual('__block__action');
  });
});
