import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import database from '../../../database';
import payloadData from '../__mocks__/cabsMocks';
import { cabService } from '../../../services/CabService';
import CabsController from '../CabsController';
import Response from '../../../helpers/responseHelper';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import HttpError from '../../../helpers/errorHandler';

const { models: { Cab } } = database;

const apiURL = '/api/v1/cabs';


describe('CabsController_getAllCabs', () => {
  let req;
  let res;
  let cabServiceSpy;
  beforeEach(() => {
    req = {
      query: {
        page: 1, size: 3
      }
    };
    res = {
      status: jest.fn(() => ({
        json: jest.fn(() => { })
      })).mockReturnValue({ json: jest.fn() })
    };
    cabServiceSpy = jest.spyOn(cabService, 'getPaginatedItems');
  });

  afterEach(() => {
    // jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('Should get all cabs and return a success message', async () => {
    const {
      cabs, successMessage, returnedData
    } = payloadData;
    cabServiceSpy.mockResolvedValue(cabs);
    jest.spyOn(Response, 'sendResponse').mockReturnValue();
    await CabsController.getAllCabs(req, res);
    expect(Response.sendResponse).toBeCalledWith(res, 200, true, successMessage, returnedData);
  });

  it('Should catch errors', async () => {
    const error = new Error('Something went wrong');
    cabServiceSpy.mockRejectedValue(error);
    jest.spyOn(BugsnagHelper, 'log').mockReturnValue();
    jest.spyOn(HttpError, 'sendErrorResponse').mockReturnValue();
    await CabsController.getAllCabs(req, res);
    expect(BugsnagHelper.log).toBeCalledWith(error);
    expect(HttpError.sendErrorResponse).toBeCalledWith(error, res);
  });
});

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

  afterAll(() => {
    database.close();
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
          expect(body.cab).toHaveProperty('regNumber');
          expect(body.cab.regNumber).toBe('KCA 545');
          expect(body.cab).toHaveProperty('capacity');
          expect(body.cab.capacity).toBe('1');
          expect(body.cab).toHaveProperty('model');
          expect(body.cab.model).toBe('Limo');
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
          message: 'Cab with registration number already exists'
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
          expect(body.data).toHaveProperty('data');
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
          expect(body.data).toHaveProperty('data');
          expect(body.data.data.length).toBe(2);
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
            message: {
              errorMessage: 'Validation error occurred, see error object for details',
              page: 'page should be a number',
              size: 'size should be a number'
            }
          },
          done
        );
    });
  });

  describe('updateCabDetails', () => {
    it('should fail to update if parameter is not a valid integer', async () => {
      await request(app)
        .put(`${apiURL}/udd`)
        .send(payloadData.updateData)
        .set(headers)
        .expect(400, {
          message: 'Please provide a positive integer value',
          success: false
        });
    });

    it('should fail to update if no data is provided', (done) => {
      request(app)
        .put(`${apiURL}/1`)
        .send({})
        .set(headers)
        .expect(400, {
          success: false,
          message: 'Validation error occurred, see error object for details',
          error: { regNumber: 'Please provide regNumber' }
        }, done);
    });

    it('should update cab details successfully', (done) => {
      request(app)
        .put(`${apiURL}/1`)
        .send(payloadData.updateData)
        .set(headers)
        .expect(200)
        .end((err, res) => {
          expect(err).toBe(null);
          const { body, status } = res;
          expect(body.data.regNumber).toEqual(payloadData.updateData.regNumber);
          expect(status).toEqual(200);
          done();
        });
    });

    it('should return 404 if cab not found', (done) => {
      request(app)
        .put(`${apiURL}/200`)
        .send(payloadData.updateDatamock)
        .set(headers)
        .expect(404)
        .end((err, res) => {
          expect(err).toBe(null);
          const { body, status } = res;
          expect(body).toEqual({ success: false, message: 'Update Failed. Cab does not exist' });
          expect(status).toEqual(404);
          done();
        });
    });

    it('should return 409 if there is a conflict', (done) => {
      request(app)
        .put(`${apiURL}/200`)
        .send(payloadData.updateData)
        .set(headers)
        .expect(409)
        .end((err, res) => {
          expect(err).toBe(null);
          const { body, status } = res;
          expect(body).toEqual({
            success: false, message: 'Cab with registration number already exists'
          });
          expect(status).toEqual(409);
          done();
        });
    });

    it('should handle internal server error', (done) => {
      jest.spyOn(cabService, 'updateCab')
        .mockRejectedValue(new Error('dummy error'));
      request(app)
        .put(`${apiURL}/1`)
        .send(payloadData.updateData)
        .set(headers)
        .expect(500)
        .end((err, res) => {
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
        regNumber: 'KCA 3453',
        model: 'Audi',
        capacity: 3,
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
      jest.spyOn(cabService, 'deleteCab').mockRejectedValue();
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
        },
        body: 'segun-andela.slack.com'
      };
      res = {
        status: jest.fn(() => ({
          json: jest.fn(() => { })
        })).mockReturnValue({ json: jest.fn() })
      };
    });
    it('should delete a cab successfully', async () => {
      jest.spyOn(cabService, 'deleteCab').mockResolvedValue(1);

      await CabsController.deleteCab(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        success: true,
        message: 'Cab successfully deleted'
      });
    });

    it('should return cab does not exist', async () => {
      jest.spyOn(cabService, 'deleteCab').mockResolvedValue(0);

      await CabsController.deleteCab(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status().json).toHaveBeenCalledWith({
        success: false,
        message: 'Cab does not exist'
      });
    });

    it('should return server error', async () => {
      jest.spyOn(cabService, 'deleteCab').mockRejectedValue();

      await CabsController.deleteCab(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({
        success: false,
        message: 'Server Error. Could not complete the request'
      });
    });
  });
});
