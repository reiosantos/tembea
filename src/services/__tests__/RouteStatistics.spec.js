import RouteStatistics from '../RouteStatistics';
import riderStats from '../__mocks__/routeRiderStatistics';
import aisService from '../AISService';
import models from '../../database/models';

const { BatchUseRecord } = models;

describe('RouteStatistics - getFrequentRiders', () => {
  const mockRiderStatsResult = jest.spyOn(BatchUseRecord, 'findAll');

  it('should return an object of rider statistics ', async () => {
    mockRiderStatsResult.mockResolvedValue(riderStats);
    const data = await RouteStatistics.getFrequentRiders('DESC', '2018-01-01', '2019-12-11', 1);

    expect(data[0].user).toHaveProperty('name', 'James Bond');
    expect(data).toStrictEqual(riderStats);
    expect(data[0].batchRecord.batch.route.name).toBe('Jazmyn Vista');
    expect(typeof data).toBe('object');
    expect(BatchUseRecord.findAll).toBeCalled();
  });

  it('should return an error in catch block', async () => {
    mockRiderStatsResult.mockResolvedValue(Promise.reject(new Error('some error')));

    const data = await RouteStatistics.getFrequentRiders();

    expect(data).toBe('some error');
  });
});

describe('RouteStatistics - getTopAndLeastFrequentRiders', () => {
  let mockedFunction;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockedFunction = jest.spyOn(RouteStatistics, 'getFrequentRiders');
  });

  it('should call getFrequentRiders twice', async () => {
    await RouteStatistics.getTopAndLeastFrequentRiders('2018-01-01', '2019-12-31', 1);

    expect(mockedFunction).toBeCalledTimes(2);
    expect(mockedFunction.mock.calls).toEqual([
      ['DESC', '2018-01-01', '2019-12-31', 1],
      ['ASC', '2018-01-01', '2019-12-31', 1]
    ]);
  });

  it('should return top and least frequent riders', async () => {
    mockedFunction.mockResolvedValue(riderStats);
    const mockedResult = {
      firstFiveMostFrequentRiders: riderStats,
      leastFiveFrequentRiders: riderStats
    };
    const result = await RouteStatistics.getTopAndLeastFrequentRiders();

    expect(result).toStrictEqual(mockedResult);
  });

  it('should return an error in catch block', async () => {
    mockedFunction.mockResolvedValue(Promise.reject(new Error('some error')));

    const data = await RouteStatistics.getTopAndLeastFrequentRiders();

    expect(data).toBe('some error');
  });
});

describe('RouteStatistics - getUserPicture', () => {
  const mockedData = 'https://lh6.googleusercontent.com/-jBtpXcQOrXs/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rcsm2s5f9G9LxqmJ4EX9JZDM7NFzA/s50/photo.jpg';
  let mockAISService;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockAISService = jest.spyOn(aisService, 'getUserDetails');
  });

  it('should return a link to the profile picture', async () => {
    mockAISService.mockResolvedValue({ picture: mockedData });
    const url = await RouteStatistics.getUserPicture('mosinmiloluwa.owoso@andela.com');

    expect(url).toEqual(mockedData);
  });

  it('should return a default profile picture', async () => {
    mockAISService.mockResolvedValue({ picture: '' });
    const url = await RouteStatistics.getUserPicture('johnxeyz@andela.com');

    expect(url).toEqual(
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    );
  });
});

describe('RouteStatistics - addUserPictures', () => {
  let mockAddUserPictures;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockAddUserPictures = jest.spyOn(RouteStatistics, 'addUserPictures');
  });

  it('should add profile picture in the object returned', async () => {
    mockAddUserPictures.mockResolvedValue(riderStats);

    const data = await RouteStatistics.addUserPictures(riderStats);

    expect(data[0]).toHaveProperty('picture');
  });
});
