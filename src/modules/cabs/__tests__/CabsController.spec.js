import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import models from '../../../database/models';
import payloadData from '../__mocks__/cabsMocks';

const { Cab } = models;

describe('CabsController', () => {
  let validToken;

  beforeAll(() => {
    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
  });

  afterAll(async () => {
    await Cab.destroy({
      where: {
        regNumber: payloadData.payload.regNumber
      }
    });
  });

  describe('createCab', () => {
    it('should return success true', (done) => {
      request(app)
        .post('/api/v1/cabs')
        .send(payloadData.payload)
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(201, {
          success: true,
          message: 'You have successfully created a cab'
        }, done);
    });

    it('should return success false if there is a conflict', (done) => {
      request(app)
        .post('/api/v1/cabs')
        .send(payloadData.payload)
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(500, {
          success: false,
          message: 'Cab registration or drivers number already exists'
        }, done);
    });

    it('should catch any server error', (done) => {
      request(app)
        .post('/api/v1/cabs')
        .send(payloadData.overloadPayload)
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(500, {
          success: false,
          message: 'Oops! Something went terribly wrong'
        }, done);
    });
  });
});
