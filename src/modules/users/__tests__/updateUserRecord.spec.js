import request from 'supertest';
import '@slack/client';
import app from '../../../app';
import Utils from '../../../utils';
import models from '../../../database/models';

const errorMessage = 'Validation error occurred, see error object for details';

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    users: {
      lookupByEmail: jest.fn(() => ({
        user: {
          id: 'XXXXXXXXX'
        }
      })),
    }
  }))
}));

let validToken;

beforeAll(() => {
  validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
});
afterAll(() => {
  models.sequelize.close();
});

describe('/User update', () => {
  it('should return a not found error with wrong email', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'unKnownEmail@test.com',
        slackUrl: 'ACME.slack.com',
        newName: 'New name',
        newPhoneNo: '2349023746389',
        newEmail: 'me.you@test.com',
        teamUrl: 'xaappy'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'User not found'
      }, done);
  });

  it('should respond with a no email provided error', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        newName: 'New name',
        newPhoneNo: '2349023746389',
        newEmail: 'me.you@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: errorMessage,
        error: {
          slackUrl: 'Please provide slackUrl',
          email: 'Please provide email'
        }
      }, done);
  });

  it('should respond with invalid email', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'sjnvdsd.com',
        newName: 'New name',
        newPhoneNo: '2349023746389',
        newEmail: 'me.you@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: errorMessage,
        error: {
          slackUrl: 'Please provide slackUrl',
          email: 'please provide a valid email address'
        }
      }, done);
  });

  it('should respond with an incomplete info message', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'unKnownEmail@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: errorMessage,
        error: {
          slackUrl: 'Please provide slackUrl',
          value: '"value" must contain at least one of [newEmail, newName, newPhoneNo]'
        }
      }, done);
  });

  it('should respond with invalid messages', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'unKnownEmail@test.com',
        slackUrl: 'https://ACME.sack.co',
        newName: ':;new 89dcj=',
        newPhoneNo: '234902374638998242-#SV',
        newEmail: 'me.youtest.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(400, {
        success: false,
        message: errorMessage,
        error: {
          slackUrl: 'please provide a valid slackUrl',
          newEmail: 'please provide a valid email address',
          newName: 'please provide a valid newName',
          newPhoneNo: 'please provide a valid newPhoneNo'
        }
      }, done);
  });

  it('should respond success', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'john.smith@gmail.com',
        slackUrl: 'ACME.slack.com',
        newName: 'New Name',
        newPhoneNo: '2349782037189',
        newEmail: 'me.you@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should respond success', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'me.you@test.com',
        slackUrl: 'ACME.slack.com',
        newName: 'New Name',
        newPhoneNo: '2349782037189'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should respond success', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'me.you@test.com',
        slackUrl: 'ACME.slack.com',
        newEmail: 'me.you@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should respond with can\'t find slack team', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'me.them@andela.com',
        slackUrl: 'ACM.slack.com',
        newName: 'New Name',
        newPhoneNo: '2349782037189',
        newEmail: 'me.you@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'Slack team not found',
      }, done);
  });
});
