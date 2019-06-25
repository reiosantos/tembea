import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import models from '../../../database/models';

let validToken; // Token for secure requests

beforeAll(() => {
  validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
});
afterAll(() => {
  models.sequelize.close();
});

describe('Get users records', () => {
  it('should fail when page does not exist', (done) => {
    request(app)
      .get('/api/v1/users?page=99999999999')
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
      .get('/api/v1/users?page=3&size=2')
      .set({
        Accept: 'application.json',
        authorization: validToken
      })
      .expect(
        200,
        done
      );
  });

  it('should return the first page of users', (done) => {
    request(app)
      .get('/api/v1/users')
      .set({
        Accept: 'application.json',
        authorization: validToken
      })
      .expect(
        200,
        done
      );
  });

  it('should fail on when invalid query params is used', (done) => {
    request(app)
      .get('/api/v1/users?page=gh&size=ds')
      .set({
        Accept: 'application.json',
        authorization: validToken
      })
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
