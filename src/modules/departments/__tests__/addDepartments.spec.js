import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import {
  noUserPayload, noEmailPayload, invalidEmailPayload,
  invalidDeptNamePayload,
  missingDeptNamePayload, validDeptPayload, existingDeptPayload, invalidLocationPayload
} from '../__mocks__/addDepartments';
import models from '../../../database/models';

let validToken;

beforeAll(() => {
  validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
});
afterAll(() => {
  models.sequelize.close();
});
describe('/Departments create', () => {
  it('should return a no user found error with wrong email', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(noUserPayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'User not found'
      }, done);
  });


  it('should respond with a no email provided error', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(noEmailPayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { email: 'Please provide email' }
      }, done);
  });

  it('should respond with invalid email', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(invalidEmailPayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400)
      .end((err, res) => {
        expect(res.body);
        done();
      });
  });

  it('should respond with invalid department name', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(invalidDeptNamePayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { name: '"name" is not allowed to be empty' }
      }, done);
  });

  it('should respond with a no name provided error', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(missingDeptNamePayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { name: 'Please provide name' }
      }, done);
  });

  it('should respond success', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(validDeptPayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(201, done);
  });

  it('should respond with a department already exists.', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(existingDeptPayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(409, {
        success: false,
        message: 'Department already exists.',
      }, done);
  });

  it('should respond with invalid department location name', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(invalidLocationPayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { location: '"location" is not allowed to be empty' }
      }, done);
  });
});
