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
});
