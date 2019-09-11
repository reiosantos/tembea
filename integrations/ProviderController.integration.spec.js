import request from 'supertest';
import faker from 'faker';
import app from '../src/app';
import Utils from '../src/utils';
import database from '../src/database';
import { createUser } from './support/helpers';
import HomeBaseFilterValidator from '../src/middlewares/HomeBaseFilterValidator';

const apiURL = '/api/v1/providers';

describe('ProvidersController', () => {
  let validToken;
  let headers;
  let mockUser;

  beforeAll(async () => {
    mockUser = await createUser({
      name: faker.name.findName(),
      slackId: faker.random.word().toUpperCase(),
      phoneNo: faker.phone.phoneNumber('080########'),
      email: faker.internet.email(),
    });

    validToken = Utils.generateToken('30m', {
      userInfo: {
        roles: ['Super Admin'], locations: [{ id: 4, name: 'Kigali' }], email: mockUser.email
      }
    });
    headers = {
      Accept: 'application/json',
      Authorization: validToken,
      homebaseid: 4
    };
    jest.spyOn(HomeBaseFilterValidator, 'validateHomeBaseAccess').mockReturnValue();
  });
  afterAll(async () => {
    await database.close();
  });


  describe('Get All Providers', () => {
    it('should return all the providers', (done) => {
      request(app)
        .get(apiURL)
        .set(headers)
        .expect(200, (err, res) => {
          const { body } = res;
          expect(body.message).toBe('1 of 1 page(s).');
          expect(body).toHaveProperty('data');
          expect(body.data).toHaveProperty('pageMeta');
          expect(body.data).toHaveProperty('providers');
          done();
        });
    });
  });

  describe('ProviderController_updateProvider', () => {
    let updateData;
    it('should update provider successfully', (done) => {
      updateData = { name: 'SharkDevs Uber' };
      request(app)
        .patch(`${apiURL}/1`)
        .send(updateData)
        .set(headers)
        .expect(200, (err, res) => {
          const { body } = res;
          expect(err).toBeNull();
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('data');
          expect(body.data.name).toEqual('SharkDevs Uber');
          done();
        });
    });
  });

  describe('ProviderController_addProvider', () => {
    it('should create provider successfully', (done) => {
      const requestData = {
        name: 'TaxiCako',
        email: mockUser.email
      };
      request(app)
        .post(apiURL)
        .send(requestData)
        .set(headers)
        .expect(201)
        .end((err, res) => {
          expect(res.body.provider.name).toEqual('TaxiCako');
          expect(res.body.message).toEqual('Provider created successfully');
          expect(res.body.provider.providerUserId).toEqual(mockUser.id);
          done();
        });
    });
  });
});
