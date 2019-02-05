import request from 'request-promise-native';
import aisService from '../AISService';
import BugsnagHelper from '../../helpers/bugsnagHelper';

describe('AISService', () => {
  it('should get user details', async () => {
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

    jest.spyOn(request, 'get').mockResolvedValueOnce(JSON.stringify(mockAISData));
    const result = await aisService.getUserDetails('test.user@test.com');
    expect(result).toEqual(mockUser);
  });

  it('should catch thrown error', async () => {
    jest.spyOn(request, 'get').mockRejectedValue(new Error('I failed :('));
    jest.spyOn(BugsnagHelper, 'log').mockImplementation().mockResolvedValue({});
    await aisService.getUserDetails('test.user@test.com');
    expect(BugsnagHelper.log).toHaveBeenCalled();
  });
});
