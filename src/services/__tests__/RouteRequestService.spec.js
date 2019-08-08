import models from '../../database/models';
import Cache from '../../cache';
import RouteRequestService from '../RouteRequestService';
import { mockRouteData, mockRouteRequestData } from '../__mocks__';
import RemoveDataValues from '../../helpers/removeDataValues';
import TeamDetailsService from '../TeamDetailsService';

const { RouteRequest } = models;

describe('Route Request Service', () => {
  let create;
  let findByPk;
  let updateSpy;
  let save;

  beforeEach(() => {
    create = jest.spyOn(RouteRequest, 'create');
    findByPk = jest.spyOn(RouteRequest, 'findByPk');
    updateSpy = jest.spyOn(RouteRequest, 'update');
    save = jest.spyOn(Cache, 'save');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('findByPk', () => {
    it('should find route request by Id', async () => {
      jest.spyOn(RemoveDataValues, 'removeDataValues');
      findByPk.mockResolvedValue(mockRouteData);
      const result = await RouteRequestService.findByPk(1);
      expect(result).toEqual(mockRouteData);
    });
  });

  describe('createRoute', () => {
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
  });

  describe('UpdateRouteRequest', () => {
    it('should update route request', async () => {
      const update = jest.fn();
      const id = 999;

      const mock = {
        ...RemoveDataValues.removeDataValues(mockRouteRequestData),
        id,
        update
      };
      updateSpy.mockResolvedValue([[], [mock]]);
      save.mockImplementation(() => ({}));
      const result = await RouteRequestService.update(id, {
        opsComment: 'ZZZZZZ'
      });
      expect(result).toEqual(mock);
    });
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

  describe('getRouteRequestAndToken', () => {
    let detailsSpy;
    let routeRequestSpy;
    beforeEach(() => {
      detailsSpy = jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken')
        .mockResolvedValue('xoop-sadasds');
      routeRequestSpy = jest.spyOn(RouteRequestService, 'getRouteRequest')
        .mockResolvedValue();
    });
    afterEach(() => {
      jest.restoreAllMocks();
      jest.restoreAllMocks();
    });
    it('should return route request and bot token', async () => {
      const routeRequestId = 1;
      const teamId = 'BBBBCCC';
      const result = await RouteRequestService.getRouteRequestAndToken(
        routeRequestId, teamId
      );

      expect(detailsSpy).toHaveBeenCalledWith(expect.any(String));
      expect(routeRequestSpy).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toBeDefined();
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.restoreAllMocks();
  });
});
