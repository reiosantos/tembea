import request from 'supertest';
import app from '../src/app';
import Utils from '../src/utils';

describe('Authentication Controller Integration Test', () => {
  describe('Verify User from frontend endpoint', () => {
    it('should return authentication successful', async () => {
      jest.spyOn(Utils, 'verifyToken').mockResolvedValue({
        UserInfo: { email: 'james.bond@email.com' }
      });

      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'token');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty(
        'message',
        'Authentication Successful'
      );
      expect(response.body.data).toHaveProperty('isAuthorized', true);
      expect(response.body.data.userInfo).toHaveProperty('roles', [
        'Super Admin',
        'Admin'
      ]);
      expect(response.body.data.userInfo).toHaveProperty(
        'email',
        'james.bond@email.com'
      );
    });

    it('should return User is not authorized', async () => {
      jest.spyOn(Utils, 'verifyToken').mockResolvedValue({
        UserInfo: { email: 'david.blake@email.com' }
      });

      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'token');

      expect(response.status).toEqual(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'User is not Authorized');
      expect(response.body.data).toHaveProperty('isAuthorized', false);
    });

    it('should return throw error when UserInfo is empty', async () => {
      jest.spyOn(Utils, 'verifyToken').mockResolvedValue({ error: '' });

      const response = await request(app)
        .get('/api/v1/auth/verify')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'token');

      expect(response.status).toEqual(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty(
        'message',
        "Cannot read property 'email' of undefined"
      );
    });
  });
});
