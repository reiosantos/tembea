import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import models from '../../../database/models';
import payloadData from '../__mocks__/cabsMocks';

const { Cab } = models;

const apiURL = '/api/v1/cabs';

describe('CabsController', () => {
  let validToken;
  let headers;

  beforeAll(() => {
    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
    headers = {
      Accept: 'application/json',
      Authorization: validToken
    };
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
        .set(headers)
        .expect(201, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('success');
          expect(body.success).toBe(true);
          expect(body).toHaveProperty('message');
          expect(body.message).toBe('You have successfully created a cab');
          expect(body).toHaveProperty('cab');
          expect(body.cab).toHaveProperty('driverName');
          expect(body.cab.driverName).toBe('Cassidy Eze');
          expect(body.cab).toHaveProperty('driverPhoneNo');
          expect(body.cab.driverPhoneNo).toBe('+254 639 003 893');
          expect(body.cab).toHaveProperty('regNumber');
          expect(body.cab.regNumber).toBe('KCA 545');
          expect(body.cab).toHaveProperty('capacity');
          expect(body.cab.capacity).toBe('1');
          expect(body.cab).toHaveProperty('model');
          expect(body.cab.model).toBe('Limo');
          expect(body.cab).toHaveProperty('location');
          expect(body.cab.location).toBe('Kampala');
          done();
        });
    });

    it('should return success false if there is a conflict', (done) => {
      request(app)
        .post('/api/v1/cabs')
        .send(payloadData.payload)
        .set(headers)
        .expect(409, {
          success: false,
          message: 'Cab registration or drivers number already exists'
        }, done);
    });

    it('should catch any server error', (done) => {
      request(app)
        .post('/api/v1/cabs')
        .send(payloadData.overloadPayload)
        .set(headers)
        .expect(500, {
          success: false,
          message: 'Oops! Something went terribly wrong'
        }, done);
    });
  });

  describe('Get All Cabs', () => {
    it('should return the first page of cabs by default', (done) => {
      request(app)
        .get(apiURL)
        .set(headers)
        .expect(200, (err, res) => {
          const { body } = res;
          expect(body.message).toBe('1 of 1 page(s).');
          expect(body).toHaveProperty('data');
          expect(body.data).toHaveProperty('pageMeta');
          expect(body.data).toHaveProperty('cabs');
          done();
        });
    });

    it('pagination should work as expected', (done) => {
      request(app)
        .get(`${apiURL}?size=2&page=2`)
        .set(headers)
        .expect(200, (err, res) => {
          const { body } = res;
          expect(body.message).toBe('2 of 14 page(s).');
          expect(body).toHaveProperty('data');
          expect(body.data).toHaveProperty('pageMeta');
          expect(body.data).toHaveProperty('cabs');
          expect(body.data.cabs.length).toBe(2);
          done();
        });
    });

    it('should fail when invalid query params are provided', (done) => {
      request(app)
        .get(`${apiURL}?page=a&size=b`)
        .set(headers)
        .expect(
          400,
          {
            success: false,
            message: 'Please provide a positive integer value'
          },
          done
        );
    });
  });
});
