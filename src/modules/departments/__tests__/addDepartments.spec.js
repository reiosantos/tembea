import request from 'supertest';
import faker from 'faker';
import sequelize from 'sequelize';
import app from '../../../app';
import Utils from '../../../utils';
import {
  noUserPayload, noEmailPayload, invalidEmailPayload,
  invalidDeptNamePayload,
  missingDeptNamePayload, validDeptPayload, existingDeptPayload, invalidLocationPayload
} from '../__mocks__/addDepartments';
import database from '../../../database';
import { createCountry } from '../../../../integrations/support/helpers';
import HomebaseService from '../../../services/HomebaseService';

describe('/Departments create', () => {
  let validToken;

  let homebaseId;

  beforeAll(async () => {
    const { id: countryId } = await createCountry({ name: faker.address.country() });
    const { homebase: { id } } = await HomebaseService.createHomebase(
      faker.address.city(), countryId
    );
    homebaseId = id;
    await Promise.all([
      database.models.User.findOrCreate({
        where: {
          email: validDeptPayload.email
        },
        defaults: {
          email: validDeptPayload.email,
          name: validDeptPayload.name,
          slackId: 'ADD_DEPT_12',
          phoneNo: '+2345168100092'
        }
      }),
      database.models.TeamDetails.findOrCreate({
        where: { teamUrl: { [sequelize.Op.or]: [validDeptPayload.slackUrl, `https://${validDeptPayload.slackUrl}`] } },
        defaults: {
          teamId: 'TE2K8PGF8',
          botId: 'UE3GMD84A',
          botToken: 'xoxb-478654798518-479565450146-yVq26h0taXK1oDTaC8dCL1zk',
          webhookConfigUrl: 'https://hooks.slack.com/services/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',
          userId: 'UE1DDAR4M',
          opsChannelId: 'CE0F7SZNU',
          // updatedAt: '2019-08-27 11:13:50.196+00',
          // createdAt: '2019-08-14 15:01:11.559+00',
          teamName: 'Andela Tembea',
          userToken: 'xoxp-478654798518-477455365157-739001288820-2503fdf307cc7630e72122c87c38d764',
          teamUrl: validDeptPayload.slackUrl
        }
      })]);


    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
  }, 10000);

  afterAll((done) => database.close().then(done, done));

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
