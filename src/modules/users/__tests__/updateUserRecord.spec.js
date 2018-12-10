import request from 'supertest';
import '@slack/client';
import TeamDetailsService from '../../../services/TeamDetailsService';
import UsersController from '../UsersController';
import app from '../../../app';

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
      })
      .set({
        Accept: 'application/json'
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
        Accept: 'application/json'
      })
      .expect(400, {
        success: false,
        message: 'Please provide a valid email for the user',
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
        Accept: 'application/json'
      })
      .expect(400, {
        success: false,
        message: 'Please provide a valid email for the user',
      }, done);
  });

  it('should respond with an incomplete info message', (done) => {
    request(app)
      .put('/api/v1/users')
      .send({
        email: 'unKnownEmail@test.com',
      })
      .set({
        Accept: 'application/json'
      })
      .expect(400, {
        success: false,
        message: 'Incomplete update information.'
        + '\nOptional properties (at least one); newName, newPhoneNo or a newEmail.'
        + '\nCompulsory property; slackUrl.'
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
        Accept: 'application/json'
      })
      .expect(400, {
        success: false,
        messages: [
          'Invalid newName.',
          'Invalid newPhoneNo.',
          'Invalid newEmail.',
          'Invalid slackUrl. e.g: ACME.slack.com'
        ],
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
        Accept: 'application/json'
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
        Accept: 'application/json'
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
        Accept: 'application/json'
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
        Accept: 'application/json'
      })
      .expect(404, {
        success: false,
        message: 'Slack team not found',
      }, done);
  });
});

describe('UserController', () => {
  it('should not be able to update user record', async (done) => {
    const res = {
      status: jest.fn(() => ({
        json: jest.fn(() => {})
      })),
    };

    try {
      await UsersController.saveNewRecord('sdnsdv', '', '', '', '', res);
    } catch (err) {
      expect(res.status.mock.calls.length).toBe(1);
      done();
    }
  });

  it('should not be able to get user', async (done) => {
    const res = {
      status: jest.fn(() => ({
        json: jest.fn(() => {})
      })),
    };

    try {
      await UsersController.getUser({}, res);
    } catch (err) {
      expect(res.status.mock.calls.length).toBe(1);
      done();
    }
  });

  it('should not be able to get slack info', async (done) => {
    const res = {
      status: jest.fn(() => ({
        json: jest.fn(() => {})
      })),
    };

    try {
      await UsersController.getUserSlackInfo({}, '', res);
    } catch (err) {
      expect(res.status.mock.calls.length).toBe(1);
      done();
    }
  });

  it('should not be able to fetch team details', async (done) => {
    const res = {
      status: jest.fn(() => ({
        json: jest.fn(() => {})
      })),
    };
    TeamDetailsService.getTeamDetailsByTeamUrl = jest.fn(() => {
      throw new Error();
    });

    try {
      await UsersController.fetchTeamDetails({}, res);
    } catch (err) {
      expect(res.status.mock.calls.length).toBe(1);
      done();
    }
  });
});
