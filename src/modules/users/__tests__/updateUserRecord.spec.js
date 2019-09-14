import request from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import database from '../../../database';
import UserService from '../../../services/UserService';

const errorMessage = 'Validation error occurred, see error object for details';
jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    users: {
      lookupByEmail: jest.fn((email) => ({
        user: {
          id: `XXXXXXXXX_${email.splice(3)}`
        }
      })),
    }
  }))
}));

describe('/User update', () => {
  let validToken;
  let teamDetails;
  let johnSmith;
  let meYou;
  beforeAll(async (done) => {
    teamDetails = await database.models.TeamDetails.create({
      teamUrl: 'https://userupdate.slack.com',
      teamId: 'UPDATE123',
      botId: 'XXXXXXX-UPDATE',
      botToken: 'XXXXXX-UPDATE',
      webhookConfigUrl: 'XXXXXXXXXXXXX',
      userId: 'XXXXXXXXXXXXX-UPDATE',
      opsChannelId: 'XXXXXXXXXXXXX',
      teamName: 'Fake Team',
      userToken: 'XXXXXXXXXXX',
    });

    ([johnSmith, meYou] = await Promise.all([
      database.models.User.create({
        email: 'john.smith@gmail.com',
        slackId: 'UU1234_UPDATE',
        phoneNo: '+245679076542',
        name: 'User Update',
      }),
      database.models.User.create({
        email: 'me.you@test.com',
        slackId: 'UU1234_UPDATE_2',
        phoneNo: '+2456790765422',
        name: 'User Updates',
      })
    ]));

    jest.spyOn(UserService, 'getUserSlackInfo').mockImplementation((_, email) => ({
      user: {
        id: `U1234_${(email).slice(0, 4)}`
      }
    }));
    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
    done();
  }, 10000);

  afterAll((done) => {
    database.close().then(done, done);
  });

  it('should return a not found error with wrong email', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'unKnownEmail@test.com',
        slackUrl: teamDetails.teamUrl,
        newName: 'New name',
        newPhoneNo: '2349023746389',
        newEmail: 'me.you@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(404, {
        success: false,
        message: 'User not found',
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

  it('should respond success 1', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: johnSmith.email,
        slackUrl: teamDetails.teamUrl,
        newName: 'New Name',
        newPhoneNo: '2349782037189',
        newEmail: 'mess.you@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should respond success 2', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: meYou.email,
        slackUrl: teamDetails.teamUrl,
        newName: 'New Name',
        newPhoneNo: '2349782037171'
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should respond success 3', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: meYou.email,
        slackUrl: teamDetails.teamUrl,
        newEmail: 'me.you@test.com',
      })
      .set({
        Accept: 'application/json',
        authorization: validToken
      })
      .expect(200, done);
  });

  it('should respond with cannot find slack team', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: meYou.email,
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
