import request from 'supertest';
import '@slack/client';
import app from '../../../app';
import UserValidator from '../../../middlewares/UserValidator';
import HttpError from '../../../helpers/errorHandler';
import Utils from '../../../utils';

let validToken;

describe('/User create', () => {
  beforeAll(() => {
    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
    jest.mock('@slack/client', () => ({
      WebClient: jest.fn(() => ({
        users: {
          lookupByEmail: jest.fn(() => ({
            user: {
              id: 'TEST123',
              profile: {
                real_name: 'Test buddy 1',
                email: 'test.buddy1@andela.com'
              }
            }
          }))
        }
      }))
    }));
  });

  it('should respond with a no email provided error', (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        slackUrl: 'ACME.slack.com'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(
        400,
        {
          success: false,
          message: 'Please provide a valid email for the user'
        },
        done
      );
  });

  it('should respond with invalid email', (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        email: 'sjnvdsd.com'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(
        400,
        {
          success: false,
          message: 'Please provide a valid email for the user'
        },
        done
      );
  });

  it('should respond with an incomplete info message', (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        email: 'unKnownEmail@test.com'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(
        400,
        {
          success: false,
          message: 'Compulsory property; slackUrl e.g: ACME.slack.com'
        },
        done
      );
  });

  it('should respond with invalid slackUrl', (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        email: 'unKnownEmail@test.com',
        slackUrl: 'ACME.sack.co'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(
        400,
        {
          success: false,
          message: 'Compulsory property; slackUrl e.g: ACME.slack.com'
        },
        done
      );
  });

  it("should respond with can't find slack team", (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        email: 'me.them@andela.com',
        slackUrl: 'ACM.slack.com'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(
        404,
        {
          success: false,
          message: 'Slack team not found'
        },
        done
      );
  });

  it('should respond success for existing user', (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        email: 'test.buddy1@andela.com',
        slackUrl: 'ACME.slack.com'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });
});

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    users: {
      lookupByEmail: jest.fn(() => ({
        user: {
          id: 'TEST123456',
          profile: {
            real_name: 'newuser',
            email: 'newuser@gmail.com'
          }
        }
      }))
    }
  }))
}));

describe('/User create user who does not exist', () => {
  it('should respond success for non existing user', (done) => {
    request(app)
      .post('/api/v1/users')
      .send({
        email: 'newuser@gmail.com',
        slackUrl: 'ACME.slack.com'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should validate info', (done) => {
    const messages = [];

    UserValidator.validateProps(
      '11111',
      messages,
      'Invalid newPhoneNo.',
      'email@email.com',
      'ACME.slack.com'
    );
    expect(messages).toEqual(['Invalid newName.', 'Invalid newPhoneNo.']);
    done();
  });

  it('should return an error', async (done) => {
    const error = new HttpError('error');
    expect(error.message).toEqual('error');
    done();
  });

  it('should return an error', async (done) => {
    const res = {
      status: jest.fn(() => ({
        json: jest.fn(() => { })
      })),
    };
    const error = { message: 'error' };
    const response = HttpError.sendErrorResponse(error, res);
    expect(response).toBeUndefined();
    done();
  });
});
