import requestCall from 'supertest';
import request from 'request-promise-native';
import app from '../../../app';
import { SlackInstallUrl } from '../HomeController';
import HomeControllerMock from '../__mocks__/HomeControllerMock';

const response = { body: JSON.stringify(HomeControllerMock) };

describe('Slack App Homepage Test', () => {
  it('should return a not found error when endpoint doesn\'t exist', (done) => {
    requestCall(app)
      .get('/notAnApp')
      .expect(404)
      .end((err, res) => {
        expect(res.body.message).toBe('Not Found. Use /api/v1 to access the api');
        done();
      });
  });

  it('should contain a title', (done) => {
    requestCall(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toMatch('<title>Welcome to Tembea</title>');
        done();
      });
  });

  it('should redirect to the slack install url', (done) => {
    requestCall(app)
      .get('/install')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toMatch(`Found. Redirecting to ${SlackInstallUrl}`);
        done();
      });
  });

  it('should render the privacy page with a title', (done) => {
    requestCall(app)
      .get('/privacy')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toMatch('Add to Slack');
        done();
      });
  });

  it('should render the support page with a title', (done) => {
    requestCall(app)
      .get('/support')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toMatch('Add to Slack');
        done();
      });
  });
});

jest.mock('request');

describe('GET /slackauth', () => {
  const mock = request;
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return an error message when a query is attached to the request', (done) => {
    mock.mockImplementation(() => response);
    requestCall(app)
      .get('/slackauth')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toMatch('Installation failed');
        done();
      });
  });

  it('should display a success message after successful adding slack to a workspace', (done) => {
    mock.mockImplementation(() => response);
    requestCall(app)
      .get('/slackauth')
      .query({ code: 'boy hoy' })
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toMatch('Thank you for installing Tembea');
        done();
      });
  });
  it('should return an error message when request fails to install bot in workspace.', (done) => {
    mock.mockImplementationOnce(() => ({ body: JSON.stringify({ oks: 'false' }) }));
    requestCall(app)
      .get('/slackauth')
      .query({ code: 'boy hoy' })
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toMatch('Tembea could not be installed in your workspace.');
        done();
      });
  });

  it('should display a success message when request fails due network issues', (done) => {
    const error = new Error('Dummy error');
    mock.mockImplementationOnce(() => Promise.reject(error));
    requestCall(app)
      .get('/slackauth')
      .query({ code: 'boy hoy' })
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toMatch(error.message);
        done();
      });
  });
});
