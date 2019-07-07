import request from 'request-promise-native';
import aisService from '../AISService';
import cache from '../../cache';
import bugsnagHelper from '../../helpers/bugsnagHelper';

describe('AISService', () => {
  const mockUser = {
    id: '-FAKeid_',
    email: 'test.user@andela.com',
    first_name: 'Test',
    last_name: 'User',
    name: 'Test User'
  };

  const mockAISData = {
    values: [
      mockUser
    ]
  };

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it('should get user details', async () => {
    jest.spyOn(request, 'get').mockResolvedValueOnce(JSON.stringify(mockAISData));
    const result = await aisService.getUserDetails('test.user@andela.com');

    expect(result).toHaveProperty('placement');
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('first_name');
    expect(result).toHaveProperty('last_name');
    expect(result).toHaveProperty('name');
  });

  it('should fetch from cache if it data is there', async () => {
    jest.spyOn(cache, 'fetch').mockResolvedValue(JSON.stringify(mockAISData));
    jest.spyOn(request, 'get').mockResolvedValue(JSON.stringify(mockAISData));
    jest.spyOn(cache, 'saveObject').mockResolvedValue({});

    await aisService.getUserDetails('test.user@andela.com');
    expect(cache.fetch).toBeCalledTimes(1);
    expect(request.get).toBeCalledTimes(0);
  });

  it('should throw a rebranded error', async () => {
    const errMessage = 'I failed :(';
    jest.spyOn(cache, 'fetch').mockRejectedValue(new Error(errMessage));
    jest.spyOn(bugsnagHelper, 'log').mockReturnValue();
    await aisService.getUserDetails('test.user@andela.com');
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });

  it('should get user details without AIS profile', async () => {
    const aisData = '{ "values": [], "total": 0 }';
    jest.spyOn(cache, 'fetch').mockResolvedValue(null);
    jest.spyOn(request, 'get').mockResolvedValue(aisData);
    jest.spyOn(JSON, 'parse');
    const result = await aisService.getUserDetails('someone@andela.com');
    expect(result.success).toEqual('true');
    expect(result).toHaveProperty('aisUserData');
    expect(result.aisUserData.first_name).toEqual('someone');
    expect(result.aisUserData.last_name).toEqual(undefined);
  });
});
