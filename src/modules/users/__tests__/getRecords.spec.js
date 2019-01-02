import request from 'supertest';
import app from '../../../app';

describe('Get users records', () => {
  it('should fail when page does not exist', (done) => {
    request(app)
      .get('/api/v1/users?page=99999999999')
      .set({
        Accept: 'application/json'
      })
      .expect(
        404,
        {
          success: false,
          message: 'There are no records on this page.'
        },
        done
      );
  });

  it('pagination should work as expected', (done) => {
    request(app)
      .get('/api/v1/users?page=3&size=2')
      .set({
        Accept: 'application.json'
      })
      .expect(
        200,
        done
      );
  });

  it('should return the first page of users', (done) => {
    request(app)
      .get('/api/v1/users')
      .set({
        Accept: 'application.json'
      })
      .expect(
        200,
        done
      );
  });

  it('should fail on when invalid query params is used', (done) => {
    request(app)
      .get('/api/v1/users?page=gh&size=ds')
      .set({
        Accept: 'application.json'
      })
      .expect(
        400,
        {
          success: false,
          message: 'Please provide a positive integer value'
        },
        done
      );
  });
});
