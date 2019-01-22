import models from '../../database/models';
import Cache from '../../cache';
import RouteRequestService from '../RouteRequestService';
import { mockRouteRequestData } from '../__mocks__';

const { RouteRequest } = models;

describe('Route Request Service', () => {
  let create;
  let findByPk;
  let save;
  beforeEach(() => {
    create = jest.spyOn(RouteRequest, 'create');
    findByPk = jest.spyOn(RouteRequest, 'findByPk');
    save = jest.spyOn(Cache, 'save');
  });
  it('should create new route request', async () => {
    const {
      engagement: { id: engagementId },
      home: { id: homeId },
      busStop: { id: busStopId },
      manager: { id: managerId }
    } = mockRouteRequestData;
    create.mockReturnValue(mockRouteRequestData);
    const result = await RouteRequestService.createRoute({
      engagementId,
      homeId,
      busStopId,
      managerId
    });
    expect(create)
      .toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0].status)
      .toEqual('Pending');
    expect(create.mock.calls[0][0].managerId)
      .toEqual(1);
    expect(result)
      .toEqual(mockRouteRequestData);
  });
  it('should update route request', async () => {
    const update = jest.fn();
    const id = 999;

    const mock = {
      ...mockRouteRequestData,
      id,
      update
    };
    findByPk.mockReturnValue(mock);
    save.mockImplementation(() => ({}));
    const result = await RouteRequestService.updateRouteRequest(id, {
      opsComment: 'ZZZZZZ'
    });
    expect(findByPk)
      .toHaveBeenCalledTimes(1);
    expect(findByPk.mock.calls[0][0])
      .toEqual(id);

    expect(update.mock.calls[0][0].status)
      .toBeUndefined();
    expect(update.mock.calls[0][0].opsComment)
      .toEqual('ZZZZZZ');

    expect(save.mock.calls[0][0])
      .toEqual(`RouteRequest_${id}`);
    expect(save.mock.calls[0][1])
      .toEqual('routeRequest');
    expect(save.mock.calls[0][2])
      .toEqual(mock);
    expect(result)
      .toEqual(mock);
  });
  describe('getRouteRequest', () => {
    let fetch;
    let saveObject;
    beforeEach(() => {
      fetch = jest.spyOn(Cache, 'fetch');
      saveObject = jest.spyOn(Cache, 'saveObject');
    });
    afterEach(() => {
      jest.restoreAllMocks();
      jest.restoreAllMocks();
    });
    it('should save on database and cache', async () => {
      const id = 123;
      const mock = {
        ...mockRouteRequestData,
        id
      };
      fetch.mockResolvedValue(null);
      saveObject.mockResolvedValue(() => ({}));
      findByPk.mockReturnValue(mock);
      const result = await RouteRequestService.getRouteRequest(id);

      expect(findByPk).toHaveBeenCalled();

      expect(result).toEqual(mock);

      expect(saveObject.mock.calls[0][0])
        .toEqual(`RouteRequest_${id}`);
      expect(saveObject.mock.calls[0][1])
        .toEqual({ routeRequest: mock });
    });
    it('should fetch route request from cache', async () => {
      const id = 123;
      const mock = {
        ...mockRouteRequestData,
        id
      };
      fetch.mockResolvedValue({ routeRequest: mock });
      const result = await RouteRequestService.getRouteRequest(id);
      expect(findByPk).not.toHaveBeenCalled();
      expect(result).toEqual(mock);
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.restoreAllMocks();
  });
});
