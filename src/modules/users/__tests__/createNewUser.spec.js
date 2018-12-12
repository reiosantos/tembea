import request from 'supertest';
import '@slack/client';
import app from '../../../app';
import UsersController from '../UsersController';
import UserValidator from '../../../middlewares/UserValidator';
import HttpError from '../../../helpers/errorHandler';

describe('/User create', () => {
  beforeAll(() => {
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
        Accept: 'application/json'
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
        Accept: 'application/json'
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
        Accept: 'application/json'
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
        Accept: 'application/json'
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
        Accept: 'application/json'
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
        Accept: 'application/json'
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
        Accept: 'application/json'
      })
      .expect(200, done);
  });

  it('should not be able to create user', async (done) => {
    try {
      await UsersController.createNewUser(1);
    } catch (error) {
      expect(error.message).toBe('Could not create user');
    }
    done();
  });

  it('should not get team details', async (done) => {
    try {
      await UsersController.fetchTeamDetails(1);
    } catch (error) {
      expect(error.message).toBe('Could not get team details');
    }
    done();
  });

  it('should not get User SlackInfo', async (done) => {
    try {
      await UsersController.getUserSlackInfo(1);
    } catch (error) {
      expect(error.message).toBe(
        "User not found. If your are providing a newEmail, it must be the same as the user's email on slack"
      );
    }
    done();
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
