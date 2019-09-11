import faker from 'faker';
import request from 'supertest';
import app from '../src/app';
import Utils from '../src/utils';
import {
  mockDeclinedRouteRequest,
  mockDataMissingTeamUrl,
  mockDataInvalidComment,
  mockDataInvalidTakeOffTime
} from '../src/services/__mocks__';
import { createRouteRequest } from './support/helpers';
import database from '../src/database';

describe('Route Request Approval/Decline', () => {
  let validToken;
  let reqHeaders;

  let routeRequestPendingId;

  beforeAll(async () => {
    validToken = Utils.generateToken('30m', {
      userInfo: { roles: ['Super Admin'], email: 'john.smith@gmail.com' }
    });
    reqHeaders = {
      Accept: 'application/json',
      Authorization: validToken
    };

    const generateData = (optional = {}) => ({
      distance: faker.finance.amount(1, 20, 2),
      opsComment: faker.lorem.sentence(),
      managerComment: faker.lorem.sentence(),
      busStopDistance: faker.finance.amount(1, 10, 1),
      routeImageUrl: 'https://image.jpg',
      status: 'Confirmed',
      engagementId: 1,
      managerId: 1,
      busStopId: 1,
      homeId: 1,
      ...optional,
    });

    let routeRequestData = generateData();
    routeRequestData = generateData();
    routeRequestData = generateData({ status: 'Pending' });
    const mockRouteRequestPending = await createRouteRequest(routeRequestData);
    routeRequestPendingId = mockRouteRequestPending.id;
  });

  afterAll(async () => {
    await database.close();
  });

  describe('Decline route request', () => {
    it('should respond with a missing request param response', (done) => {
      request(app)
        .put('/api/v1/routes/requests/status/1')
        .set(reqHeaders)
        .send(mockDataMissingTeamUrl)
        .expect(
          400,
          {
            success: false,
            message: 'Validation error occurred, see error object for details',
            error: {
              teamUrl: 'Please provide teamUrl',
              provider: '"provider" is not allowed'
            }
          },
        );
      done();
    });

    it('should respond with pending route request response', async (done) => {
      const response = await request(app)
        .put(`/api/v1/routes/requests/status/${routeRequestPendingId}`)
        .set(reqHeaders)
        .send(mockDeclinedRouteRequest);
      expect(response.status).toEqual(409);
      expect(response.body.message).toEqual(
        'This request needs to be confirmed by the manager first'
      );
      done();
    });

    it('should respond with an invalid request', (done) => {
      request(app)
        .put(`/api/v1/routes/requests/status/${routeRequestPendingId}`)
        .set(reqHeaders)
        .send(mockDataInvalidComment)
        .expect(
          400,
          {
            success: false,
            message: 'Validation error occurred, see error object for details',
            error: { comment: '"comment" is not allowed to be empty' }
          },
        );
      done();
    });
  });

  describe('Approve a route request', () => {
    it('should respond with an invalid request for invalid time format', (done) => {
      request(app)
        .put(`/api/v1/routes/requests/status/${routeRequestPendingId}`)
        .set(reqHeaders)
        .send(mockDataInvalidTakeOffTime)
        .expect(
          400,
          {
            success: false,
            message: 'Validation error occurred, see error object for details',
            error: {
              takeOff: 'please provide a valid takeOff',
            }
          },
        );
      done();
    });
    it('should invalid token', async (done) => {
      const response = await request(app)
        .put(`/api/v1/routes/requests/status/${routeRequestPendingId}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'XXXXXXXXXXX')
        .send(mockDeclinedRouteRequest);

      expect(response.body.message).toEqual(
        'Failed to authenticate token! Valid token required'
      );
      done();
    });
  });
});
