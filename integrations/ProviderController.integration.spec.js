import request from 'supertest';
import app from '../src/app';
import Utils from '../src/utils';


const apiURL = '/api/v1/providers';

describe('ProvidersController', () => {
  let validToken;
  let headers;

  beforeAll(() => {
    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
    headers = {
      Accept: 'application/json',
      Authorization: validToken
    };
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
  describe('ProviderController_updateProvider', async () => {
    describe('ProviderController_updateProvider', async () => {
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
  });
});
