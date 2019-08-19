import HomebaseService from '../../services/HomebaseService';
import HomeBaseHelper from '../HomeBaseHelper';

describe('HomeBaseHelper', () => {
  let findHomeBaseSpy;

  beforeEach(() => {
    findHomeBaseSpy = jest.spyOn(HomebaseService, 'getById');
  });

  it('should return false if homebase does not exist', async () => {
    findHomeBaseSpy.mockResolvedValue(null);
    const result = await HomeBaseHelper.checkIfHomeBaseExists(2343);
    expect(result).toBeNull();
  });

  it('should return false if homebase does not exist', async () => {
    const mockHomeBase = {
      id: 8,
      countryId: 13,
      channel: 'uuf',
      name: 'Berkshire'
    };
    findHomeBaseSpy.mockResolvedValue(mockHomeBase);
    const result = await HomeBaseHelper.checkIfHomeBaseExists(8);
    expect(result).toBe(mockHomeBase);
  });
});
