import requestCall from 'supertest';
import app from '../src/app';
import database from '../src/database';
import Utils from '../src/utils';
import {
  mockCreateCountry, mockDeleteCountry, mockUpdateCountry
} from '../src/modules/countries/__mocks__';

const { models: { Country } } = database;

describe('Countries controller', () => {
  let validToken;
  beforeEach(async () => {
    jest.setTimeout(10000);
    validToken = Utils.generateToken('30m', { userInfo: { rules: ['admin'] } });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  afterAll(async () => {
    await database.close();
  });

  it('e2e Test: should return a list of all countries', async () => {
    const activeCountriesCount = await Country.count({ where: { status: 'Active' } });

    await requestCall(app)
      .get('/api/v1/countries')
      .set('Authorization', validToken)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body.countries).toHaveLength(activeCountriesCount);
        expect(res.body.countries[0].status).toBe('Active');
      });
  });

  it('e2e Test: should create a country successfully', async () => {
    await requestCall(app)
      .post('/api/v1/countries')
      .set('Authorization', validToken)
      .send(mockCreateCountry)
      .then((res) => {
        expect(res.status).toEqual(201);
        expect(res.body.country.status).toBe('Active');
        expect(res.body.success).toEqual(true);
      });
  });
  it('e2e Test: should update a country successfully', async () => {
    await requestCall(app)
      .put('/api/v1/countries')
      .set('Authorization', validToken)
      .send(mockUpdateCountry)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body.country.status).toBe('Active');
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Country updated successfully');
      });
  });
  it('e2e Test: should delete a country successfully', async () => {
    await requestCall(app)
      .delete('/api/v1/countries')
      .set('Authorization', validToken)
      .send(mockDeleteCountry)
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('The country has been deleted');
      });
  });
});
