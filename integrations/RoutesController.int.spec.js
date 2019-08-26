import requestCall from 'supertest';
import faker from 'faker';
import app from '../src/app';
import database from '../src/database';
import { mockRouteRequestData } from '../src/services/__mocks__';
import Utils from '../src/utils';
import { createUser } from './support/helpers';

const {
  models: {
    RouteRequest, Engagement, Country, Homebase,
  }
} = database;

describe('Route Request Controller', () => {
  let validToken;
  let mockUser;

  beforeAll(async () => {
    const { id } = await Country.create({
      name: faker.name.findName(),
    });
    const homebase = await Homebase.create({
      country: faker.name.findName(),
      countryId: id
    });
    mockUser = await createUser({
      name: faker.name.findName(),
      slackId: faker.random.word().toUpperCase(),
      phoneNo: faker.phone.phoneNumber('080########'),
      email: faker.internet.email(),
      homebaseId: homebase.id
    });
    validToken = Utils.generateToken('30m',
      { userInfo: { roles: ['admin'], email: mockUser.email } });

    const engagement = await Engagement.create({
      fellowId: mockUser.id,
      partnerId: 1,
      startDate: '2019-01-22',
      endDate: '2019-05-22',
      workHours: '13:00-22:00',
    });

    const {
      home: { id: homeId },
      busStop: { id: busStopId },
      routeImageUrl,
      managerComment,
      distance,
      busStopDistance
    } = mockRouteRequestData;

    await RouteRequest.create({
      routeImageUrl,
      managerId: mockUser.id,
      busStopId,
      homeId,
      engagementId: engagement.id,
      opsComment: null,
      managerComment,
      distance,
      busStopDistance,
      status: 'Confirmed',
      homebaseId: homebase.id,
    });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await database.close();
  });

  it('e2e Test: should return a list of all route requests', (done) => {
    requestCall(app)
      .get('/api/v1/routes/requests')
      .set('Authorization', validToken)
      .expect(200, done);
  });
});
