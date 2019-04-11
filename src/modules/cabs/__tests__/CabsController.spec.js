import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import models from '../../../database/models';
import payloadData from '../__mocks__/cabsMocks';
import CabService from '../../../services/CabService';
import MockData from '../../../middlewares/__mocks__/CabsValidatorMocks';
import CabsController from '../CabsController';

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
        .post(apiURL)
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
        .post(apiURL)
        .send(payloadData.payload)
        .set(headers)
        .expect(409, {
          success: false,
          message: 'Cab registration or drivers number already exists'
        }, done);
    });

    it('should catch any server error', (done) => {
      request(app)
        .post(apiURL)
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

  describe('updateCabDetails', () => {
    it('should fail to update if paramter is not a valid interger', (done) => {
      request(app)
        .put(`${apiURL}/udd`)
        .send(payloadData.updateData)
        .set(headers)
        .expect(400, {
          success: false,
          message:
            { invalidParameter: 'Id should be a valid integer' }
        }, done);
    });

    it('should fail to update if no data is provided', (done) => {
      const { noInputsError } = MockData;
      request(app)
        .put(`${apiURL}/1`)
        .send({})
        .set(headers)
        .expect(400, noInputsError, done);
    });

    it('should update cab details successfully', (done) => {
      request(app)
        .put(`${apiURL}/1`)
        .send(payloadData.updateData)
        .set(headers)
        .expect(200, (err, res) => {
          expect(err).toBe(null);
          const { body, status } = res;
          expect(body.data.driverName).toEqual(payloadData.updateData.driverName);
          expect(status).toEqual(200);
          done();
        });
    });

    it('should return 404 if cab not found', (done) => {
      request(app)
        .put(`${apiURL}/200`)
        .send(payloadData.updateData)
        .set(headers)
        .expect(404, (err, res) => {
          expect(err).toBe(null);
          const { body, status } = res;
          expect(body).toEqual({ success: false, message: 'Update Failed. Cab does not exist' });
          expect(status).toEqual(404);
          done();
        });
    });
    it('should handle internal server error', (done) => {
      jest.spyOn(CabService, 'updateCab')
        .mockRejectedValue(new Error('dummy error'));
      request(app)
        .put(`${apiURL}/1`)
        .send(payloadData.updateData)
        .set(headers)
        .expect(500, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('success');
          expect(body).toEqual({ message: 'dummy error', success: false });
          done();
        });
    });
  });

  describe('deleteCab', () => {
    beforeAll(async () => {
      await Cab.bulkCreate([{
        id: 40,
        driverName: 'Mabishi',
        driverPhoneNo: '07327899928',
        regNumber: 'KCA 3453',
        model: 'Audi',
        capacity: 3,
        location: 'Zùrich'
      }]);
    });
    
    it('should delete a cab successfully', (done) => {
      request(app)
        .delete(`${apiURL}/40`)
        .set(headers)
        .expect(200, {
          success: true,
          message: 'Cab successfully deleted'
        }, done);
    });

    it('should return an error when a cab does not exist', (done) => {
      request(app)
        .delete(`${apiURL}/89`)
        .set(headers)
        .expect(404, {
          success: false,
          message: 'Cab does not exist'
        }, done);
    });

    it('should return a server error when something goes wrong', (done) => {
      CabService.deleteCab = jest.fn(() => {
        throw Error();
      });
      request(app)
        .delete(`${apiURL}/89`)
        .set(headers)
        .expect(500, {
          success: false,
          message: 'Server Error. Could not complete the request'
        }, done);
    });
  });

  describe('deleteCab', () => {
    let req;
    let res;
    beforeEach(() => {
      req = {
        params: {
          id: 1
        }
      };
      res = {
        status: jest.fn(() => ({
          json: jest.fn(() => {})
        })).mockReturnValue({ json: jest.fn() })
      };
    });
    it('should delete a cab successfully', async (done) => {
      CabService.deleteCab = jest.fn(() => 1);

      await CabsController.deleteCab(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        success: true,
        message: 'Cab successfully deleted'
      });
      done();
    });

    it('should return cab does not exist', async (done) => {
      CabService.deleteCab = jest.fn(() => 0);

      await CabsController.deleteCab(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status().json).toHaveBeenCalledWith({
        success: false,
        message: 'Cab does not exist'
      });
      done();
    });

    it('should return server error', async (done) => {
      CabService.deleteCab = jest.fn(() => {
        throw Error();
      });

      await CabsController.deleteCab(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({
        success: false,
        message: 'Server Error. Could not complete the request'
      });
      done();
    });
  });
});
