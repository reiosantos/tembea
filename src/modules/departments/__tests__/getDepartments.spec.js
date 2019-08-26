import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import database from '../../../database';
import UserService from '../../../services/UserService';
import DepartmentService from '../../../services/DepartmentService';


describe('Get department records', () => {
  let validToken;

  beforeAll(() => {
    validToken = Utils.generateToken('30m', {
      userInfo: {
        roles: ['Super Admin'],
        locations: [{ id: 1 }, { id: 2 }]
      },

    });
  });
  afterAll(() => {
    database.close();
  });

  it('should fail when page does not exist', (done) => {
    jest.spyOn(UserService, 'getUserByEmail').mockImplementation(() => ({ homebaseId: 1 }));
    jest.spyOn(DepartmentService, 'getAllDepartments').mockImplementation(() => (
      { count: 0, rows: 0 }));
    request(app)
      .get('/api/v1/departments?page=1000000000000')
      .set({
        Accept: 'application/json',
        authorization: validToken,
        homebaseid: 1
      })
      .expect(404, {
        success: false,
        message: 'There are no records on this page.'
      },
      done);
  });

  it('should paginate the departments record', (done) => {
    jest.spyOn(UserService, 'getUserByEmail').mockImplementation(() => ({ homebaseId: 1 }));
    jest.spyOn(DepartmentService, 'getAllDepartments').mockImplementation(() => (
      { count: 1, rows: 2 }));
    request(app)
      .get('/api/v1/departments?page=3&size=2')
      .set({
        Accept: 'application/json',
        authorization: validToken,
        homebaseid: 1
      })
      .expect(
        200,
        done
      );
  });

  it('should return the first page of departments', (done) => {
    request(app)
      .get('/api/v1/departments')
      .set({
        Accept: 'application/json',
        authorization: validToken,
        homebaseid: 1
      })
      .expect(
        200,
        done
      );
  });

  it('should fail when invalid query params are used', (done) => {
    request(app)
      .get('/api/v1/departments?page=gh&size=ds')
      .set({
        Accept: 'application/json',
        authorization: validToken,
        homebaseid: 1

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
