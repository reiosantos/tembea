import requestCall from 'supertest';
import request from 'request-promise-native';
import app from '../../../app';
import { SlackInstallUrl } from '../HomeController';
import HomeControllerMock from '../__mocks__/HomeControllerMock';

const response = { body: JSON.stringify(HomeControllerMock) };

jest.mock('request');
const mock = request;
mock.mockImplementation(() => response);
mock();

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

  it('should return an error message when a query is attached to the request', (done) => {
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
});
