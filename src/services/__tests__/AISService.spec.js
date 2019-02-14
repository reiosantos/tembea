import request from 'request-promise-native';
import aisService from '../AISService';
import cache from '../../cache';

describe('AISService', () => {
  const mockUser = {
    id: '-FAKeid_',
    email: 'test.user@test.com',
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
    const result = await aisService.getUserDetails('test.user@test.com');
    expect(result).toEqual(mockUser);
  });

  it('should fetch from cache if it data is there', async () => {
    jest.spyOn(cache, 'fetch').mockResolvedValueOnce(JSON.stringify(mockAISData));
    jest.spyOn(request, 'get').mockResolvedValueOnce(JSON.stringify(mockAISData));
    jest.spyOn(cache, 'saveObject').mockResolvedValue({});

    await aisService.getUserDetails('test.user@test.com');
    // Will be called 2 times because of the ternary statement
    expect(cache.fetch).toBeCalledTimes(2);
    expect(request.get).toBeCalledTimes(0);
  });

  it('should throw a rebranded error', async () => {
    const errMessage = 'I failed :(';
    jest.spyOn(cache, 'fetch').mockRejectedValue(new Error(errMessage));

    expect(aisService.getUserDetails('test.user@test.com')).rejects.toThrow(Error);
  });
});
