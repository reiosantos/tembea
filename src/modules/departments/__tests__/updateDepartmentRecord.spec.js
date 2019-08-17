import request from 'supertest';
import faker from 'faker';
import app from '../../../app';
import Utils from '../../../utils';
import models from '../../../database/models';
import {
  createCountry, createDepartment, createUser
} from '../../../../integrations/support/helpers';
import HomebaseService from '../../../services/HomebaseService';


describe('/Departments update', () => {
  let validToken;
  let headId;
  let mockDepartment;
  let mockHomeBase;
  let homeBaseId;
  let departmentId;

  beforeAll(async () => {
    const mockCountry = await createCountry({
      name: faker.address.country()
    });
    mockHomeBase = await HomebaseService.createHomebase(
      faker.address.city(), mockCountry.id
    );
    const { homebase: { id } } = mockHomeBase;
    homeBaseId = id;

    const mockDeptHead = await createUser({
      name: faker.name.findName(),
      slackId: faker.random.word().toUpperCase(),
      phoneNo: faker.phone.phoneNumber('080########'),
      email: faker.internet.email(),
      homebaseId: homeBaseId

    });
    headId = mockDeptHead.id;

    const mockUser = await createUser({
      name: faker.name.findName(),
      slackId: faker.random.word().toUpperCase(),
      phoneNo: faker.phone.phoneNumber('080########'),
      email: faker.internet.email(),
      homebaseId: homeBaseId
    });

    const departmentData = {
      name: faker.random.word(),
      headId: mockUser.id,
      teamId: faker.random.word().toUpperCase(),
      homebaseId: homeBaseId
    };
    mockDepartment = await createDepartment(departmentData);
    departmentId = mockDepartment.id;
    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
  });

  afterAll(() => {
    models.sequelize.close();
  });

  it('should return a department not found error with wrong id', async () => {
    await request(app)
      .put('/api/v1/departments/1000000')
      .send({
        name: 'newDepartmentName',
        homebaseId: mockDepartment.homebaseId
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'Department not found. To add a new department use POST /api/v1/departments'
      });
  });

  it('should return a user not found when the headId does not exist in the database', async () => {
    await request(app)
      .put(`/api/v1/departments/${departmentId}`)
      .send({
        name: 'departmentName',
        headId: 1200023,
        homebaseId: mockDepartment.homebaseId
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'Department Head with headId 1200023 does not exists'
      });
  });


  it('should return a provide valid Head id when the headId is not valid', async () => {
    await request(app)
      .put(`/api/v1/departments/${departmentId}`)
      .send({
        name: 'departmentName',
        headId: 'invalidHeadId',
        homebaseId: mockDepartment.homebaseId

      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'Validation error occurred, see error object for details',
        error: { headId: 'headId should be a number' }
      });
  });

  it('should return homebase error when non existent homebase Id is provided', async () => {
    await request(app)
      .put(`/api/v1/departments/${departmentId}`)
      .send({
        name: 'departmentName',
        headId,
        homebaseId: 220000
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: 'No HomeBase exists with provided homeBaseId',
      });
  });

  it('should successfully create department with valid data', async () => {
    const newDeptName = faker.hacker.noun();
    await request(app)
      .put(`/api/v1/departments/${departmentId}`)
      .send({
        name: newDeptName,
        headId,
        homebaseId: mockDepartment.homebaseId,
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200);
  });
});
