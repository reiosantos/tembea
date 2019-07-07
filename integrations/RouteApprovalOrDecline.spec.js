import faker from 'faker';
import request from 'supertest';
import app from '../src/app';
import Utils from '../src/utils';
import {
  mockDeclinedRouteRequest,
  mockDataMissingTeamUrl,
  mockDataInvalidComment,
  mockDataInvalidCapacity,
  mockDataInvalidTakeOffTime,
  mockDataCorrectRouteRequest
} from '../src/services/__mocks__';
import { createRouteRequest } from './support/helpers';
import models from '../src/database/models';

describe('Route Request Approval/Decline', () => {
  let validToken;
  let reqHeaders;

  let mockRouteRequest;
  let mockRouteRequestTwo;
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
    mockRouteRequest = await createRouteRequest(routeRequestData);
    routeRequestData = generateData();
    mockRouteRequestTwo = await createRouteRequest(routeRequestData);
    routeRequestData = generateData({ status: 'Pending' });
    const mockRouteRequestPending = await createRouteRequest(routeRequestData);
    routeRequestPendingId = mockRouteRequestPending.id;
  });

  afterAll(() => {
    models.sequelize.close();
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
            message: 'Some properties are missing',
            errors: ['Please provide teamUrl.']
          },
          done
        );
    });

    it('should respond with an invalid request', (done) => {
      request(app)
        .put('/api/v1/routes/requests/status/1')
        .set(reqHeaders)
        .send(mockDataInvalidComment)
        .expect(
          400,
          {
            success: false,
            message: 'comment can only contain words and [,."\' -]',
          },
          done
        );
    });

    it('should respond with pending route request response', async () => {
      const response = await request(app)
        .put('/api/v1/routes/requests/status/3')
        .set(reqHeaders)
        .send(mockDeclinedRouteRequest);
      expect(response.status).toEqual(409);
      expect(response.body.message).toEqual(
        'This request needs to be confirmed by the manager first'
      );
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
            message: 'comment can only contain words and [,."\' -]',
          },
          done
        );
    });

    it('should decline request', async () => {
      const response = await request(app)
        .put(`/api/v1/routes/requests/status/${mockRouteRequest.id}`)
        .set(reqHeaders)
        .send(mockDeclinedRouteRequest);

      expect(response.body.message).toEqual(
        'This route request has been updated'
      );
    });
  });

  describe('Approve a route request', () => {
    it('should return a 409 response if request is pending', (done) => {
      request(app)
        .put(`/api/v1/routes/requests/status/${routeRequestPendingId}`)
        .set(reqHeaders)
        .send(mockDataInvalidCapacity)
        .expect(
          409,
          {
            success: false,
            message: 'This request needs to be confirmed by the manager first',
          },
          done
        );
    });

    it('should respond with an invalid request for invalid time format', (done) => {
      request(app)
        .put(`/api/v1/routes/requests/status/${routeRequestPendingId}`)
        .set(reqHeaders)
        .send(mockDataInvalidTakeOffTime)
        .expect(
          400,
          {
            success: false,
            message: 'Take off time must be in the right format e.g 11:30',
          },
          done
        );
    });
    it('should invalid token', async () => {
      const response = await request(app)
        .put(`/api/v1/routes/requests/status/${routeRequestPendingId}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'XXXXXXXXXXX')
        .send(mockDeclinedRouteRequest);

      expect(response.body.message).toEqual(
        'Failed to authenticate token! Valid token required'
      );
    });
    it('should respond with pending route request response', async () => {
      const response = await request(app)
        .put(`/api/v1/routes/requests/status/${routeRequestPendingId}`)
        .set(reqHeaders)
        .send(mockDeclinedRouteRequest);
      expect(response.status).toEqual(409);
      expect(response.body.message).toEqual(
        'This request needs to be confirmed by the manager first'
      );
    });
    it('should approve request', (done) => {
      request(app)
        .put(`/api/v1/routes/requests/status/${mockRouteRequestTwo.id}`)
        .set(reqHeaders)
        .send(mockDataCorrectRouteRequest)
        .expect(
          201,
          done
        );
    });
  });
});
