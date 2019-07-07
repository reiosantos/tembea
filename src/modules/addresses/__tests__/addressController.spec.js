import request from 'supertest';
import '@slack/client';
import app from '../../../app';
import AddressController from '../AddressController';
import Utils from '../../../utils';
import models from '../../../database/models';

let validToken;

beforeAll(() => {
  validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
});
afterAll(() => {
  models.sequelize.close();
});

describe('/Addresses post request for adding new address', () => {
  describe('user input validations', () => {
    it('should respond with a compulsory property not provided', (done) => {
      request(app)
        .post('/api/v1/addresses')
        .send({
          longitude: 9,
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          400,
          {
            success: false,
            message: 'Incomplete address information. '
              + 'Compulsory properties; address, latitude, longitude.'
          },
          done
        );
    });

    it('should respond with invalid longitude', (done) => {
      request(app)
        .post('/api/v1/addresses')
        .send({
          longitude: '1234invalid',
          latitude: 9,
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          400,
          {
            success: false,
            message: ['Invalid longitude should be between -180 and 180']
          },
          done
        );
    });
  });

  describe('creating new address', () => {
    it('should respond successfully after creating valid address', (done) => {
      request(app)
        .post('/api/v1/addresses')
        .send({
          longitude: 12,
          latitude: 9,
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(201, done);
    });
  });

  describe('unsuccessfull creating new address', () => {
    it('should respond unsuccessfully creating address that exists', (done) => {
      request(app)
        .post('/api/v1/addresses')
        .send({
          longitude: 12,
          latitude: -9,
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          400,
          {
            success: false,
            message: 'Address already exists'
          },
          done
        );
    });

    it('should respond unsuccessfully for location already exists', (done) => {
      request(app)
        .post('/api/v1/addresses')
        .send({
          longitude: 12,
          latitude: 9,
          address: 'existing location'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          400,
          {
            success: false,
            message: 'This location has been used already by an existing address'
          },
          done
        );
    });
  });
});

describe('/Addresses update addresses', () => {
  describe('user input validations', () => {
    it('should respond unsuccessfully for missing properties', (done) => {
      request(app)
        .put('/api/v1/addresses')
        .send({ address: 'dojo' })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          400,
          {
            success: false,
            message: 'Incomplete update information.'
              + '\nOptional properties (at least one); newLongitude, newLatitude or a newAddress.'
              + '\nCompulsory property; address.'
          },
          done
        );
    });

    it('should respond unsuccessfully for invalid properties', (done) => {
      request(app)
        .put('/api/v1/addresses')
        .send({
          newLongitude: '1234invalid',
          newLatitude: 9,
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          400,
          {
            success: false,
            message: ['Invalid longitude should be between -180 and 180']
          },
          done
        );
    });

    it('should respond unsuccessfully for invalid properties', (done) => {
      request(app)
        .put('/api/v1/addresses')
        .send({
          newLongitude: '1234invalid',
          newLatitude: 9,
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          400,
          {
            success: false,
            message: ['Invalid longitude should be between -180 and 180']
          },
          done
        );
    });
  });

  describe('updating an address', () => {
    it('should respond unsuccessfully for location that exists', (done) => {
      request(app)
        .put('/api/v1/addresses')
        .send({
          newLongitude: 12,
          newLatitude: 9,
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          400,
          {
            success: false,
            message: 'This location has been used already by an existing address'
          },
          done
        );
    });

    it('should respond unsuccessfully for address that does not exist', (done) => {
      request(app)
        .put('/api/v1/addresses')
        .send({
          newLongitude: 12,
          newLatitude: 9,
          address: 'does not exist'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(
          404,
          {
            success: false,
            message: 'Address does not exist'
          },
          done
        );
    });

    it('should respond successfully after updating valid address', (done) => {
      request(app)
        .put('/api/v1/addresses')
        .send({
          newLongitude: 12,
          newLatitude: 73,
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(200, done);
    });

    it('should respond successfully after updating only the address', (done) => {
      request(app)
        .put('/api/v1/addresses')
        .send({
          newAddress: 'newAddress',
          address: 'dojo'
        })
        .set({
          Accept: 'application/json',
          authorization: validToken
        })
        .expect(200, done);
    });
  });
});

describe('/Addresses get addresses', () => {
  it('should return the first page of addresses', (done) => {
    request(app)
      .get('/api/v1/addresses')
      .set({
        Accept: 'application.json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should fail when page does not exist', (done) => {
    request(app)
      .get('/api/v1/addresses?page=99999999999')
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(
        404,
        {
          success: false,
          message: 'There are no records on this page.'
        },
        done
      );
  });

  it('pagination should work as expected', (done) => {
    request(app)
      .get('/api/v1/addresses?page=1&size=2')
      .set({
        Accept: 'application.json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should fail when invalid query params are used', (done) => {
    request(app)
      .get('/api/v1/addresses?page=gh&size=ds')
      .set({
        Accept: 'application.json',
        authorization: validToken
      })
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

describe('AddressController', () => {
  const errorMessage = "Cannot read property 'status' of undefined";
  it('should return error for invalid parameters in addNewAddress', async () => {
    try {
      await AddressController.addNewAddress();
    } catch (error) {
      expect(error.message).toBe(errorMessage);
    }
  });

  it('should return error for invalid parameters in updateAddress', async () => {
    try {
      await AddressController.updateAddress();
    } catch (error) {
      expect(error.message).toBe(errorMessage);
    }
  });
});
