import request from 'supertest';
import faker from 'faker';
import app from '../../../app';
import Utils from '../../../utils';
import models from '../../../database/models';
import { createUser, createDepartment } from '../../../../integrations/support/helpers';

let validToken;
let mockDeptHead;
let mockDepartment;

beforeAll(async () => {
  mockDeptHead = await createUser({
    name: faker.name.findName(),
    slackId: faker.random.word().toUpperCase(),
    phoneNo: faker.phone.phoneNumber('080########'),
    email: faker.internet.email(),
  });
  const mockUser = await createUser({
    name: faker.name.findName(),
    slackId: faker.random.word().toUpperCase(),
    phoneNo: faker.phone.phoneNumber('080########'),
    email: faker.internet.email(),
  });
  const departmentData = {
    name: faker.random.word(),
    headId: mockUser.id,
    teamId: faker.random.word().toUpperCase(),
  };
  mockDepartment = await createDepartment(departmentData);

  validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
});

afterAll(() => {
  models.sequelize.close();
});

describe('/Departments update', () => {
  it('should return a department not found error with wrong department name', (done) => {
    request(app)
      .put('/api/v1/departments')
      .send({
        name: 'NoDepartment',
        newName: 'newDepartmentName'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'Department not found. To add a new department use POST /api/v1/departments'
      }, done);
  });

  it('should return a user not found when the email does not exist in the database', (done) => {
    request(app)
      .put('/api/v1/departments')
      .send({
        name: 'TDD',
        newHeadEmail: 'unknownuser254@gmail.com'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'User not found'
      }, done);
  });

  it('should return a department not found when the name does not exist', (done) => {
    request(app)
      .put('/api/v1/departments')
      .send({
        name: 'abcd',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, done);
  });

  it('should return a provide valid email when the email is not valid', (done) => {
    request(app)
      .put('/api/v1/departments')
      .send({
        name: 'TDD',
        newHeadEmail: 'invalidEmail'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { newHeadEmail: 'please provide a valid email address' }
      }, done);
  });

  it('should return provide value when property is defined with no value', (done) => {
    request(app)
      .put('/api/v1/departments')
      .send({
        name: 'TDD',
        newHeadEmail: ''
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { newHeadEmail: 'please provide a valid email address' }
      }, done);
  });

  it('should successfully create department with valid data', (done) => {
    const newDeptName = faker.hacker.noun();
    request(app)
      .put('/api/v1/departments')
      .send({
        name: mockDepartment.name,
        newName: newDeptName,
        newHeadEmail: mockDeptHead.email,
        location: 'kenya'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });
});
