import faker from 'faker';
import HomebaseService from '../HomebaseService';
import models from '../../database/models';
import { mockCreatedHomebase, mockNewHomebase } from '../__mocks__';
import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import { mockedValue } from '../../modules/trips/__tests__/__mocks__';
import UserService from '../UserService';
import { createCountry } from '../../../integrations/support/helpers';

jest.mock('../../helpers/sequelizePaginationHelper', () => jest.fn());
const { Homebase } = models;

describe('test HomebaseService', () => {
  let createHomebaseSpy;
  const country = {
    name: 'Kenya',
    id: 1
  };
  const homebaseInfo = [{
    id: 1,
    name: 'Nairobi',
    createdAt: '2019-05-05T10:57:31.476Z',
    updatedAt: '2019-05-05T10:57:31.476Z'
  }];

  const filterParams = {
    country: 'kenya',
    name: 'NairobI'
  };

  const where = {
    country: 'Kenya'
  };

  beforeEach(() => {
    SequelizePaginationHelper.mockClear();
    createHomebaseSpy = jest.spyOn(Homebase, 'findOrCreate');
    jest.spyOn(HomebaseService, 'formatName');
    jest.spyOn(HomebaseService, 'createFilter');
    jest.spyOn(HomebaseService, 'serializeCountry');
    jest.spyOn(HomebaseService, 'getAllHomebases');
    jest.spyOn(HomebaseService, 'getHomeBaseBySlackId');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('creates a homebase successfully', async () => {
    createHomebaseSpy.mockResolvedValue([mockNewHomebase]);
    const result = await HomebaseService.createHomebase('Nairobi', 1, 'UO23D');
    expect(createHomebaseSpy).toHaveBeenCalled();
    expect(HomebaseService.formatName).toHaveBeenCalled();
    expect(result).toEqual(mockCreatedHomebase);
  });

  it('serializeCountry', () => {
    const result = HomebaseService.serializeCountry(country);
    expect(result).toEqual(country.name);
  });

  it('serializeHomebase', () => {
    const homebase = { country, homebaseInfo };
    const result = HomebaseService.serializeHomebases(homebase);
    expect(HomebaseService.serializeCountry).toHaveBeenCalledWith(country);
    expect(result).toEqual({
      id: homebaseInfo.id,
      homebaseName: homebaseInfo.name,
      country: country.name,
      createdAt: homebaseInfo.createdAt,
      updatedAt: homebaseInfo.updatedAt
    });
  });

  it('createFilter', () => {
    const res = HomebaseService.createFilter(where);
    expect(Object.keys(res).length).toEqual(2);
    expect(res).toHaveProperty('where');
    expect(res).toHaveProperty('include');
  });

  it('formatName', () => {
    const res = HomebaseService.formatName('naIRoBi');
    expect(res).toEqual('Nairobi');
  });

  it('whereClause', () => {
    const res = HomebaseService.getWhereClause(filterParams);
    expect(HomebaseService.formatName).toHaveBeenCalledTimes(2);
    expect(res).toEqual({
      country: 'Kenya', name: 'Nairobi'
    });
  });

  it('getHomebases', async () => {
    const getPageItems = jest.fn().mockResolvedValue({
      data: {
        map: jest.fn()
      },
      pageMeta: {}
    });

    SequelizePaginationHelper.mockImplementation(() => ({
      getPageItems
    }));
    const pageable = {
      page: 1,
      size: 10
    };

    await HomebaseService.getHomebases(pageable, where);
    expect(HomebaseService.createFilter).toHaveBeenCalledWith(where);
    expect(SequelizePaginationHelper).toHaveBeenCalled();
    expect(getPageItems).toHaveBeenCalledWith(pageable.page);
  });

  it('should get all Homebases', async () => {
    jest.spyOn(Homebase, 'findAll').mockResolvedValue(mockedValue);
    await HomebaseService.getAllHomebases();
    expect(Homebase.findAll).toBeCalled();
    expect(Homebase.findAll).toBeCalledWith({ attributes: { include: ['id', 'name', 'channel'] } });
  });

  it('should get homebase by User slack ID', async () => {
    jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue({ homebaseId: 1 });
    jest.spyOn(Homebase, 'findOne').mockResolvedValue(mockedValue);
    await HomebaseService.getHomeBaseBySlackId(1);
    expect(Homebase.findOne).toBeCalled();
    expect(Homebase.findOne).toBeCalledWith(
      {
        attributes: ['id', 'name', 'channel'],
        where: { id: 1 }
      }
    );
  });
});

describe('update HomeBase', () => {
  let mockHomeBase;
  beforeAll(async () => {
    const mockCountry = await createCountry(faker.address.country().concat('z'));
    mockHomeBase = await HomebaseService.createHomebase(
      faker.address.city().concat('z'),
      mockCountry.id,
      faker.address.county()
    );
    await HomebaseService.createHomebase(
      'Duplicatetest',
      mockCountry.id,
      faker.address.county()
    );
  });
  afterAll(() => {
    models.Sequelize.close();
  });

  it('should update the homebase', async () => {
    const { homebase: { id } } = mockHomeBase;
    const homeBaseName = faker.address.county().concat('w');
    const result = await HomebaseService.update(
      homeBaseName, id, 'U08ETD'
    );
    expect(result.name).toBe(homeBaseName);
  });
});
