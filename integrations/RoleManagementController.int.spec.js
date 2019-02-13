import request from 'supertest';
import app from '../src/app';
import Utils from '../src/utils';

describe.skip('RoleManagement Controller Integration Test', () => {
  let validToken;
  beforeAll(() => {
    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
  });

  describe('Create new role endpoint', () => {
    it('should create the role successfully', async () => {
      const roleData = { roleName: 'Basic User' };
      const response = await request(app)
        .post('/api/v1/roles')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(roleData);

      expect(response.status).toEqual(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Role has been created successfully');
      expect(response.body.data).toHaveProperty('name', 'Basic User');
    });

    it('should return error response with role already exists', async () => {
      const roleData = { roleName: 'Basic User' };
      const response = await request(app)
        .post('/api/v1/roles')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(roleData);

      expect(response.status).toEqual(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Role already exists');
    });
  });

  describe('Read all roles endpoint', () => {
    it('should return a response with All available roles', async () => {
      const response = await request(app)
        .get('/api/v1/roles')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken);

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'All available roles');
      expect(response.body.data[0]).toHaveProperty('name', 'Super Admin');
      expect(response.body.data[1]).toHaveProperty('name', 'Admin');
    });
  });

  describe('Read a users role endpoint', () => {
    it('should return ths users roles', async () => {
      const response = await request(app)
        .get('/api/v1/roles/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .query({ email: 'james.bond@email.com' });

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User roles');
      expect(response.body.data[0]).toHaveProperty('name', 'Super Admin');
      expect(response.body.data[1]).toHaveProperty('name', 'Admin');
    });

    it('should return response with user has no role', async () => {
      const response = await request(app)
        .get('/api/v1/roles/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .query({ email: 'david.blake@email.com' });

      expect(response.status).toEqual(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'User has no role');
    });
  });

  describe('Assign role to user endpoint', () => {
    it('should return assign role and return success message', async () => {
      const data = { email: 'john.lee@email.com', roleName: 'Admin' };
      const response = await request(app)
        .post('/api/v1/roles/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(data);

      expect(response.status).toEqual(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Role was successfully assigned to the user');
    });

    it('should return response with role already assigned to user', async () => {
      const data = { email: 'james.bond@email.com', roleName: 'Admin' };
      const response = await request(app)
        .post('/api/v1/roles/user')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(data);

      expect(response.status).toEqual(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'This Role is already assigned to this user');
    });
  });
});
