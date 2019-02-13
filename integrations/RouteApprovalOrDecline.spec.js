import request from 'supertest';
import app from '../src/app';
import model from '../src/database/models';
import Utils from '../src/utils';


const { RouteRequest } = model;

describe('Decline route request', () => {
  let validToken;
  describe('/api/v1/routes/requests/status/:requestId', () => {
    beforeAll(async () => {
      await RouteRequest.bulkCreate([
        {
          id: 2,
          distance: 12.764,
          busStopDistance: 1.34,
          routeImageUrl: 'https://image.com',
          status: 'Pending',
          engagementId: 1,
          managerId: 1,
          busStopId: 1,
          homeId: 1
        }, {
          id: 3,
          distance: 12.764,
          busStopDistance: 1.34,
          routeImageUrl: 'https://image.com',
          status: 'Confirmed',
          engagementId: 1,
          managerId: 1,
          busStopId: 1,
          homeId: 1
        }
      ]);
      validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
    });

    afterAll(async () => {
      await RouteRequest.destroy({
        where: {
          distance: 12.764
        }
      });
    });

    it('should respond with an missing request param response', (done) => {
      request(app)
        .put('/api/v1/routes/requests/status/1')
        .set({
          Accept: 'application/json'
        })
        .send({
          newOpsStatus: 'decline',
          comment: 'some comment',
          reviewerEmail: 'test.buddy2@andela.com'
        })
        .expect(
          400,
          {
            success: false,
            message: 'Some properties are missing',
            errors: [
              'Please provide teamUrl.'
            ]
          },
          done
        );
    });

    it('should respond with an invalid request', (done) => {
      request(app)
        .put('/api/v1/routes/requests/status/1')
        .set({
          Accept: 'application/json'
        })
        .send({
          newOpsStatus: 'decline',
          comment: 'some = comment',
          reviewerEmail: 'test.buddy2@andela.com',
          teamUrl: 'tembea.slack.com'
        })
        .expect(
          400,
          {
            success: false,
            message: 'comment can only contain words and [,."\' -]'
          },
          done
        );
    });

    it('should respond with pending route request response', async () => {
      const response = await request(app)
        .put('/api/v1/routes/requests/status/2')
        .set('Content-Type', 'application/json')
        .send({
          newOpsStatus: 'decline',
          comment: 'some comment',
          reviewerEmail: 'test.buddy2@andela.com',
          teamUrl: 'tembea.slack.com'
        });

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual(
        'This request needs to be confirmed by the manager first'
      );
    });

    it('should invalid token', async () => {
      const response = await request(app)
        .put('/api/v1/routes/requests/status/3')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'XXXXXXXXXXX')
        .send({
          newOpsStatus: 'decline',
          comment: 'some comment',
          reviewerEmail: 'test.buddy2@andela.com',
          teamUrl: 'tembea.slack.com'
        });

      expect(response.body.message).toEqual(
        'Failed to authenticate token! Valid token required'
      );
    });

    it('should decline request', async () => {
      const response = await request(app)
        .put('/api/v1/routes/requests/status/3')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send({
          newOpsStatus: 'decline',
          comment: 'some comment',
          reviewerEmail: 'test.buddy2@andela.com',
          teamUrl: 'tembea.slack.com'
        });

      expect(response.body.message).toEqual(
        'This route request has been updated'
      );
    });
  });
});

describe('Approve a route request', () => {
  let validToken;
  describe('/api/v1/routes/requests/:requestId', () => {
    beforeAll(async () => {
      await RouteRequest.bulkCreate([
        {
          id: 2,
          distance: 12.764,
          busStopDistance: 1.34,
          routeImageUrl: 'https://image.com',
          status: 'Pending',
          engagementId: 1,
          managerId: 1,
          busStopId: 1,
          homeId: 1
        }, {
          id: 4,
          distance: 12.764,
          busStopDistance: 1.34,
          routeImageUrl: 'https://image.com',
          status: 'Confirmed',
          engagementId: 1,
          managerId: 1,
          busStopId: 1,
          homeId: 1
        },
      ]);

      validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
    });

    afterAll(async () => {
      await RouteRequest.destroy({
        where: {
          distance: 12.764
        }
      });
    });

    it('should respond with a missing request param response', (done) => {
      request(app)
        .put('/api/v1/routes/requests/status/1')
        .set({
          Accept: 'application/json'
        })
        .send({
          newOpsStatus: 'approve',
          comment: 'some comment',
          reviewerEmail: 'test.buddy2@andela.com',
          teamUrl: 'andela.slack.com'
        })
        .expect(
          400,
          {
            success: false,
            message: 'Some properties are missing for approval',
            errors: [
              'Please provide routeName.',
              'Please provide capacity.',
              'Please provide takeOff.',
              'Please provide cabRegNumber.'
            ]
          },
          done
        );
    });
    it('should respond with an invalid request for invalid capacity', (done) => {
      request(app)
        .put('/api/v1/routes/requests/status/1')
        .set({
          Accept: 'application/json'
        })
        .send({
          newOpsStatus: 'approve',
          comment: 'comment',
          reviewerEmail: 'test.buddy2@andela.com',
          teamUrl: 'tembea.slack.com',
          routeName: 'ParksWay',
          capacity: 'capacity',
          takeOff: '2:30',
          cabRegNumber: 'KCX XXX0'
        })
        .expect(
          400,
          {
            success: false,
            message: 'Capacity must be an integer greater than zero'
          },
          done
        );
    });

    it('should respond with an invalid request for invalid take off time', (done) => {
      request(app)
        .put('/api/v1/routes/requests/status/1')
        .set({
          Accept: 'application/json'
        })
        .send({
          newOpsStatus: 'approve',
          comment: 'comment',
          reviewerEmail: 'test.buddy2@andela.com',
          teamUrl: 'tembea.slack.com',
          routeName: 'ParksWay',
          capacity: '2',
          takeOff: 'Take Off',
          cabRegNumber: 'KCX XXX0'
        })
        .expect(
          400,
          {
            success: false,
            message: 'Take off time must be in the right format e.g 11:30'
          },
          done
        );
    });
    it('should approve request', (done) => {
      request(app)
        .put('/api/v1/routes/requests/status/4')
        .set({
          Accept: 'application/json',
          Authorization: validToken
        })
        .send({
          newOpsStatus: 'approve',
          comment: 'some comment',
          reviewerEmail: 'test.buddy2@andela.com',
          teamUrl: 'tembea.slack.com',
          routeName: 'ParksWay',
          capacity: '2',
          takeOff: '9:30',
          cabRegNumber: 'KCX XXX0'
        })
        .expect(
          201,
          done
        );
    });
  });
});
