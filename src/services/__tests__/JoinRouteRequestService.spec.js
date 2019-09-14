import models from '../../database/models';
import JoinRouteRequestService from '../JoinRouteRequestService';
import Cache from '../../cache';
import { Bugsnag } from '../../helpers/bugsnagHelper';

const { JoinRequest } = models;
describe('JoinRouteRequestService', () => {
  let create;
  let findByPk;
  let cacheSave;
  let cacheSaveObject;
  let cacheFetch;

  const joinRequestData = {
    id: 1,
    status: 'Pending',
    engagement: { engagementId: 1 },
    manager: { managerId: 2 },
    routeBatch: { routeBatchId: 1 },
  };
  beforeEach(() => {
    create = jest.spyOn(JoinRequest, 'create');
    findByPk = jest.spyOn(JoinRequest, 'findByPk').mockReturnValue(joinRequestData);
    cacheFetch = jest.spyOn(Cache, 'fetch');
    cacheSaveObject = jest.spyOn(Cache, 'saveObject').mockImplementation(data => data);
    cacheSave = jest.spyOn(Cache, 'save');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('createJoinRouteRequest', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should create a new join route request', async () => {
      create.mockReturnValue(joinRequestData);
      const result = await JoinRouteRequestService.createJoinRouteRequest(1, 2, 1);
      expect(result).toEqual(joinRequestData);
      expect(create).toBeCalledTimes(1);
      expect(create.mock.calls[0][0].status)
        .toEqual('Pending');
      expect(create.mock.calls[0][0].managerId)
        .toEqual(2);
    });
    it('should log on error on bugsnag', async () => {
      create.mockImplementationOnce(() => { throw new Error('very error'); });
      const spy = jest.spyOn(Bugsnag.prototype, 'log');
      await JoinRouteRequestService.createJoinRouteRequest(1, 2, 1, 'comment');
      expect(spy).toBeCalledWith(new Error('very error'));
    });
  });

  it('should update join route request', async () => {
    const update = jest.fn();
    const data = { ...joinRequestData, update };
    jest.spyOn(JoinRouteRequestService, 'getJoinRouteRequestByPk')
      .mockImplementationOnce(() => data);
    cacheFetch.mockReturnValue(undefined);
    const result = await JoinRouteRequestService.updateJoinRouteRequest(1, data);
    expect(update).toBeCalledWith(data);
    expect(result).toEqual(data);
    expect(cacheSave).toBeCalledWith('JoinRequest_1', 'joinRouteRequest', data);
  });

  describe('getJoinRouteRequest', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should fetch a join route request by pk from database', async () => {
      cacheFetch.mockReturnValue(undefined);
      const result = await JoinRouteRequestService.getJoinRouteRequest(1);
      expect(cacheFetch).toBeCalledWith('JoinRequest_1');
      expect(cacheSaveObject).toHaveBeenCalledWith(
        'JoinRequest_1', { joinRequest: { ...joinRequestData } }
      );
      expect(findByPk).toBeCalled();
      expect(result).toEqual(joinRequestData);
    });

    it('should fetch join route request from cache', async () => {
      cacheFetch.mockReturnValue({ joinRequest: { ...joinRequestData } });
      const result = await JoinRouteRequestService.getJoinRouteRequest(1);
      expect(cacheFetch).toBeCalledWith('JoinRequest_1');
      expect(cacheSaveObject).not.toBeCalled();
      expect(result).toEqual(joinRequestData);
    });
  });
});
