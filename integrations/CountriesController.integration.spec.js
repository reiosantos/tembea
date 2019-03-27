import requestCall from 'supertest';
import app from '../src/app';
import models from '../src/database/models';
import Utils from '../src/utils';
import { mockCountry, mockCountry2, mockUpdateCountry } from '../src/modules/countries/__mocks__';

const { Country } = models;

describe('Countries controller', () => {
  let validToken;
  beforeEach(async () => {
    validToken = Utils.generateToken('30m', { userInfo: { rules: ['admin'] } });

    const { name } = mockCountry;
    await Country.destroy({ where: {} });
    await Country.create({
      name
    });
    afterEach(async (done) => {
      jest.restoreAllMocks();
      jest.restoreAllMocks();
      done();
    });
    afterAll(async (done) => {
      await Country.destroy({ where: {} });
      done();
    });
  });
  it('e2e Test: should return a list of all countries', (done) => {
    requestCall(app)
      .get('/api/v1/countries')
      .set('Authorization', validToken)
      .expect(200)
      .end((err, res) => {
        expect(res.body.countries).toHaveLength(1);
        expect(res.body.countries[0].status).toBe('Active');
        done();
      });
  });

  it('e2e Test: should create a country successfully', (done) => {
    requestCall(app)
      .post('/api/v1/countries')
      .set('Authorization', validToken)
      .expect(201)
      .send(mockCountry2)
      .end((err, res) => {
        expect(res.body.country.status).toBe('Active');
        expect(res.body.success).toEqual(true);
        done();
      });
  });
  it('e2e Test: should update a country successfully', (done) => {
    requestCall(app)
      .put('/api/v1/countries')
      .set('Authorization', validToken)
      .expect(200)
      .send(mockUpdateCountry)
      .end((err, res) => {
        expect(res.body.country.status).toBe('Active');
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('Country updated successfully');
        done();
      });
  });
  it('e2e Test: should delete a country successfully', (done) => {
    requestCall(app)
      .delete('/api/v1/countries')
      .set('Authorization', validToken)
      .expect(200)
      .send(mockCountry)
      .end((err, res) => {
        expect(res.body.success).toEqual(true);
        expect(res.body.message).toEqual('The country has been deleted');
        done();
      });
  });
});
