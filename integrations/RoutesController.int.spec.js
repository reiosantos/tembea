import requestCall from 'supertest';
import app from '../src/app';
import models from '../src/database/models';
import { mockRouteRequestData } from '../src/services/__mocks__';
import Utils from '../src/utils';

const { RouteRequest } = models;

describe('Route Request Controller', () => {
  let validToken;
  beforeEach(async (done) => {
    validToken = Utils.generateToken('30m', { userInfo: { rules: ['admin'] } });

    const {
      engagement: { id: engagementId },
      home: { id: homeId },
      busStop: { id: busStopId },
      manager: { id: managerId },
      routeImageUrl,
      managerComment,
      distance,
      busStopDistance
    } = mockRouteRequestData;

    await RouteRequest.destroy({ where: {} });
    await RouteRequest.create({
      routeImageUrl,
      managerId,
      busStopId,
      homeId,
      engagementId,
      opsComment: null,
      managerComment,
      distance,
      busStopDistance,
      status: 'Confirmed',
    });
    done();
  });

  afterEach(async (done) => {
    jest.restoreAllMocks();
    jest.restoreAllMocks();
    done();
  });

  afterAll(async (done) => {
    await RouteRequest.destroy({ where: {} });
    done();
  });

  it('e2e Test: should return a list of all route requests', (done) => {
    requestCall(app)
      .get('/api/v1/routes/requests')
      .set('Authorization', validToken)
      .expect(200)
      .end((err, res) => {
        expect(res.body.routes).toHaveLength(1);
        expect(res.body.routes[0].status).toBe('Confirmed');

        done();
      });
  });
});
