import requestCall from 'supertest';
import app from '../src/app';
import Utils from '../src/utils';
import models from '../src/database/models';

const { Country } = models;

describe('Homebase Controller', () => {
  let validToken;
  let mockHomebaseReq;

  beforeAll(async () => {
    validToken = Utils.generateToken('30m', { userInfo: { rules: ['admin'] } });

    mockHomebaseReq = {
      homebaseName: 'Kampala',
      countryName: 'Uganda'
    };

    await Country.create({
      name: 'Uganda'
    });
  }, 10000);

  afterAll(async () => {
    await models.sequelize.close();
  });

  it('e2e Test: should create a homebase successfully', (done) => {
    requestCall(app)
      .post('/api/v1/homebases')
      .set('Authorization', validToken)
      .expect(201)
      .send(mockHomebaseReq)
      .end((err, res) => {
        expect(res.body.homeBase.name).toBe('Kampala');
        expect(res.body.success).toEqual(true);
        done();
      });
  }, 10000);
});
