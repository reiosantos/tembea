import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import {
  noUserPayload, noEmailPayload, invalidEmailPayload,
  invalidDeptNamePayload, numericDeptNamePayload,
  missingDeptNamePayload, validDeptPayload, existingDeptPayload,
  numericLocationPayload, missingDeptLocationPayload, invalidLocationPayload
} from '../__mocks__/addDepartments';

let validToken;

beforeAll(() => {
  validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
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
        messages: ['Please provide email.'],
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
        messages: ['Please provide a valid department name.'],
      }, done);
  });

  it('should respond with department name cannot contain numeric values', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(numericDeptNamePayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        messages: ['Department name cannot contain numeric values only.'],
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
        messages: ['Please provide name.'],
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

  it('should respond with department location cannot contain numeric values', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(numericLocationPayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        messages: ['Department location cannot contain numeric values only.'],
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
        messages: ['Please provide a valid department location.'],
      }, done);
  });

  it('should respond with a no location provided error', (done) => {
    request(app)
      .post('/api/v1/departments')
      .send(missingDeptLocationPayload)
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        messages: ['Please provide location.'],
      }, done);
  });
});
