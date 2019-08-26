import requestCall from 'supertest';
import faker from 'faker';
import app from '../src/app';
import Utils from '../src/utils';
import database from '../src/database';

const { models: { Country } } = database;

describe('Homebase Controller', () => {
  let validToken;
  let mockHomebaseReq;

  beforeAll(async () => {
    validToken = Utils.generateToken('30m', { userInfo: { rules: ['admin'] } });

    const mockCountry = await Country.create({
      name: faker.address.country().concat('x')
    });

    mockHomebaseReq = {
      homebaseName: 'Bukoto',
      countryId: mockCountry.id,
      channel: faker.random.alphaNumeric()
    };
  }, 10000);

  afterAll(async () => {
    await database.close();
  });

  it('e2e Test: should create a homebase successfully', async () => {
    const result = await requestCall(app)
      .post('/api/v1/homebases')
      .set('Authorization', validToken)
      .send(mockHomebaseReq)
      .expect(201);
    const { success, message, homeBase: { name, channel } } = JSON.parse(result.text);
    expect(success).toBe(true);
    expect(message).toBe('Homebase created successfully');
    expect(name).toBe(mockHomebaseReq.homebaseName);
    expect(channel).toBe(mockHomebaseReq.channel);
  }, 10000);
});
