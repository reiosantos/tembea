import request from 'supertest';
import faker from 'faker';
import app from '../../../app';
import Utils from '../../../utils';
import {
  noUserPayload, noEmailPayload, invalidEmailPayload,
  invalidDeptNamePayload,
  missingDeptNamePayload, validDeptPayload, existingDeptPayload, invalidLocationPayload
} from '../__mocks__/addDepartments';
import models from '../../../database/models';
import { createCountry } from '../../../../integrations/support/helpers';
import HomebaseService from '../../../services/HomebaseService';

let validToken;

let homebaseId;

beforeAll(async () => {
  const { id: countryId } = await createCountry({ name: faker.address.country() });
  const { homebase: { id } } = await HomebaseService.createHomebase(
    faker.address.city(), countryId
  );
  homebaseId = id;


  validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
});
afterAll(() => {
  models.sequelize.close();
});
describe('/Departments create', () => {
  it('should return a no user found error with wrong email', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...noUserPayload, homebaseId })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'User not found'
      });
  });


  it('should respond with a no email provided error', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...noEmailPayload, homebaseId })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { email: 'Please provide email' }
      });
  });

  it('should respond with invalid email', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...invalidEmailPayload, homebaseId })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { email: 'please provide a valid email address' }
      });
  });

  it('should respond with invalid department name', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...invalidDeptNamePayload, homebaseId })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { name: '"name" is not allowed to be empty' }
      });
  });

  it('should respond with a no name provided error', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...missingDeptNamePayload, homebaseId })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { name: 'Please provide name' }
      });
  });

  it('should respond success', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...validDeptPayload, homebaseId })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(201);
  });

  it('should respond with a department already exists.', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...existingDeptPayload, homebaseId })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(409, {
        success: false,
        message: 'Department already exists.',
      });
  });

  it('should respond with missing homebaseId error', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...invalidLocationPayload })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'No HomeBase exists with provided homebaseId'
      });
  });

  it('should respond with invalid HomeBase Id', async () => {
    await request(app)
      .post('/api/v1/departments')
      .send({ ...validDeptPayload })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { homebaseId: 'Please provide homebaseId' }
      });
  });
});
